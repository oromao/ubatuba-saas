import { Injectable, BadRequestException } from '@nestjs/common';
import * as JSZip from 'jszip';

export interface ParsedShapefile {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: any;
    properties: Record<string, unknown>;
  }>;
}

@Injectable()
export class ShapefileService {
  async parse(buffer: Buffer, originalName?: string): Promise<ParsedShapefile> {
    const name = (originalName || '').toLowerCase();

    if (name.endsWith('.zip')) {
      return this.parseZip(buffer);
    }
    if (name.endsWith('.shp')) {
      return this.parseShp(buffer);
    }
    throw new BadRequestException(
      'Formato não suportado. Envie um arquivo .shp ou .zip contendo .shp + .dbf + .shx',
    );
  }

  private async parseZip(buffer: Buffer): Promise<ParsedShapefile> {
    const zip = await JSZip.loadAsync(buffer);

    const shpFile = this.findInZip(zip, '.shp');
    const dbfFile = this.findInZip(zip, '.dbf');
    const prjFile = this.findInZip(zip, '.prj');

    if (!shpFile) {
      throw new BadRequestException('Arquivo .shp não encontrado dentro do .zip');
    }

    const shpBuffer = await shpFile.async('nodebuffer');
    const dbfBuffer = dbfFile ? await dbfFile.async('nodebuffer') : null;

    return this.parseShpPair(shpBuffer, dbfBuffer, prjFile ? await prjFile.async('text') : null);
  }

  private findInZip(zip: JSZip, ext: string): JSZip.JSZipObject | null {
    const files = zip.file(/.*/);
    for (const file of files) {
      if (file.name.toLowerCase().endsWith(ext)) return file;
    }
    return null;
  }

  private async parseShp(buffer: Buffer): Promise<ParsedShapefile> {
    return this.parseShpPair(buffer, null, null);
  }

  private async parseShpPair(
    shpBuffer: Buffer,
    dbfBuffer: Buffer | null,
    prjText: string | null,
  ): Promise<ParsedShapefile> {
    const shapefile = await import('shapefile');

    const shpArray = new Uint8Array(shpBuffer);
    const dbfArray = dbfBuffer ? new Uint8Array(dbfBuffer) : null;

    const source = dbfArray
      ? await shapefile.open(shpArray, dbfArray)
      : await shapefile.openShp(shpArray);

    const features: ParsedShapefile['features'] = [];

    while (true) {
      const result = await source.read();
      if (result.done) break;
      const feature = result.value;
      if (!feature || !feature.geometry) continue;

      const crsNote = prjText ? { crs_original: prjText.trim() } : {};

      features.push({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          ...feature.properties,
          ...crsNote,
        },
      });
    }

    if (features.length === 0) {
      throw new BadRequestException('Nenhuma feature encontrada no shapefile');
    }

    return { type: 'FeatureCollection', features };
  }
}
