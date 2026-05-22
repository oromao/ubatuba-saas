// apps/api/src/modules/ctm/parcels/shapefile-import.service.ts
/**
 * ShapefileImportService
 *
 * Recebe um Buffer de arquivo ZIP contendo .shp, .dbf e .prj,
 * extrai os componentes com JSZip, lê as features com a biblioteca
 * `shapefile` (Node.js puro, sem GDAL), detecta o CRS pelo .prj
 * e reproj para WGS84 usando proj4 + convertGeometryCoordinates.
 *
 * O resultado é um GeoJSON FeatureCollection pronto para ser
 * entregue ao ParcelsService.importGeojson().
 */

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as JSZip from 'jszip';
import * as shapefile from 'shapefile';
import * as GeoJSON from 'geojson';
import {
  convertGeometryCoordinates,
  detectCrsFromCoordinates,
  CRS_WGS84,
  CRS_SIRGAS2000_UTM_23S,
  CRS_SIRGAS2000_UTM_24S,
} from '../../../common/utils/crs';

export interface ShapefileImportResult {
  featureCollection: GeoJSON.FeatureCollection;
  warnings: string[];
  detectedCrs: string | null;
  totalFeatures: number;
}

@Injectable()
export class ShapefileImportService {
  private readonly logger = new Logger(ShapefileImportService.name);

  /**
   * Detecta o CRS a partir do conteúdo de um arquivo .prj (WKT).
   * Retorna o EPSG code correspondente ou null.
   */
  private detectCrsFromPrj(prjContent: string): string | null {
    if (!prjContent) return null;
    const upper = prjContent.toUpperCase();

    // WGS84
    if (upper.includes('WGS_1984') || upper.includes('WGS84') || upper.includes('GCS_WGS_1984')) {
      return CRS_WGS84;
    }
    // SIRGAS 2000 UTM Zone 23S
    if (
      (upper.includes('SIRGAS_2000') || upper.includes('SIRGAS2000') || upper.includes('GRS_1980')) &&
      upper.includes('ZONE_23')
    ) {
      return CRS_SIRGAS2000_UTM_23S;
    }
    // SIRGAS 2000 UTM Zone 24S
    if (
      (upper.includes('SIRGAS_2000') || upper.includes('SIRGAS2000') || upper.includes('GRS_1980')) &&
      upper.includes('ZONE_24')
    ) {
      return CRS_SIRGAS2000_UTM_24S;
    }
    // Web Mercator
    if (upper.includes('WEB_MERCATOR') || upper.includes('MERCATOR') || upper.includes('3857')) {
      return 'EPSG:3857';
    }

    return null;
  }

  /**
   * Reproj uma geometria GeoJSON de sourceCrs para WGS84.
   * Se a conversão falhar para uma feature, retorna null.
   */
  private reprojectGeometry(
    geometry: GeoJSON.Geometry,
    sourceCrs: string,
  ): GeoJSON.Geometry | null {
    if (sourceCrs === CRS_WGS84) return geometry;
    return convertGeometryCoordinates(geometry, sourceCrs, CRS_WGS84);
  }

  /**
   * Ponto de entrada principal.
   * @param zipBuffer Buffer do arquivo ZIP contendo .shp, .dbf (obrigatórios) e .prj (opcional)
   * @returns ShapefileImportResult com FeatureCollection em WGS84 e warnings
   */
  async parseShpZip(zipBuffer: Buffer): Promise<ShapefileImportResult> {
    const warnings: string[] = [];

    // 1. Extrair ZIP
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(zipBuffer);
    } catch {
      throw new BadRequestException('Arquivo inválido: não é um ZIP válido');
    }

    // 2. Localizar .shp, .dbf, .prj (case-insensitive)
    const files = Object.keys(zip.files);

    const shpEntry = files.find((f) => f.toLowerCase().endsWith('.shp') && !zip.files[f].dir);
    const dbfEntry = files.find((f) => f.toLowerCase().endsWith('.dbf') && !zip.files[f].dir);
    const prjEntry = files.find((f) => f.toLowerCase().endsWith('.prj') && !zip.files[f].dir);

    if (!shpEntry) {
      throw new BadRequestException('ZIP inválido: arquivo .shp não encontrado');
    }
    if (!dbfEntry) {
      warnings.push('Arquivo .dbf não encontrado — atributos (propriedades) estarão ausentes');
    }

    // 3. Ler buffers
    const shpBuffer = Buffer.from(await zip.files[shpEntry].async('arraybuffer'));
    const dbfBuffer = dbfEntry
      ? Buffer.from(await zip.files[dbfEntry].async('arraybuffer'))
      : undefined;

    // 4. Detectar CRS via .prj
    let detectedCrs: string | null = null;
    if (prjEntry) {
      const prjContent = await zip.files[prjEntry].async('string');
      detectedCrs = this.detectCrsFromPrj(prjContent);
      if (!detectedCrs) {
        warnings.push('.prj encontrado mas CRS não reconhecido — assumindo WGS84');
        detectedCrs = CRS_WGS84;
      }
      this.logger.log(`CRS detectado via .prj: ${detectedCrs}`);
    } else {
      warnings.push('.prj não encontrado — assumindo WGS84');
      detectedCrs = CRS_WGS84;
    }

    // 5. Ler features com shapefile
    const features: GeoJSON.Feature[] = [];
    let skipped = 0;

    try {
      const source = await shapefile.open(shpBuffer as any, dbfBuffer as any);

      while (true) {
        const result = await source.read();
        if (result.done) break;

        const feature = result.value as GeoJSON.Feature;
        if (!feature || !feature.geometry) {
          skipped++;
          continue;
        }

        // 6. Reprojetar se necessário
        if (detectedCrs !== CRS_WGS84) {
          // Auto-detect se o .prj não foi conclusivo mas coordenadas são UTM
          const coords = this.extractFirstCoordinate(feature.geometry);
          const runtimeCrs = coords
            ? detectCrsFromCoordinates(coords).detectedCrs || detectedCrs
            : detectedCrs;

          const reprojected = this.reprojectGeometry(feature.geometry, runtimeCrs);
          if (!reprojected) {
            skipped++;
            warnings.push(`Feature #${features.length + skipped}: reprojeção falhou, ignorada`);
            continue;
          }
          features.push({ ...feature, geometry: reprojected });
        } else {
          features.push(feature);
        }
      }
    } catch (err: any) {
      throw new BadRequestException(`Erro ao processar Shapefile: ${err?.message || 'erro desconhecido'}`);
    }

    if (skipped > 0) {
      warnings.push(`${skipped} feature(s) ignorada(s) por geometria ausente ou erro de reprojeção`);
    }

    if (features.length === 0) {
      warnings.push('Nenhuma feature válida encontrada no Shapefile');
    }

    const featureCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features,
    };

    return {
      featureCollection,
      warnings,
      detectedCrs,
      totalFeatures: features.length,
    };
  }

  /**
   * Extrai o primeiro par de coordenadas de uma geometria para
   * detecção automática de CRS em runtime.
   */
  private extractFirstCoordinate(geometry: GeoJSON.Geometry): number[] | null {
    try {
      if (geometry.type === 'Point') return geometry.coordinates as number[];
      if (geometry.type === 'LineString') return (geometry.coordinates as number[][])[0];
      if (geometry.type === 'Polygon') return (geometry.coordinates as number[][][])[0][0];
      if (geometry.type === 'MultiPolygon') return (geometry.coordinates as number[][][][])[0][0][0];
    } catch {
      return null;
    }
    return null;
  }
}
