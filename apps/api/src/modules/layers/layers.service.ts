import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../shared/cache.service';
import { Layer, LayerDocument, LayerGeometryType } from './layer.schema';
import { LayersRepository } from './layers.repository';
import { UpdateLayerDto } from './dto/update-layer.dto';
import { ImportLayerDto, BulkImportLayersDto } from './dto/import-layer.dto';
import { asObjectId } from '../../common/utils/object-id';

type LayerResponse = Layer & {
  id: string;
  legendUrl?: string;
  tileUrl?: string;
};

@Injectable()
export class LayersService {
  private readonly logger = new Logger(LayersService.name);

  constructor(
    private readonly layersRepository: LayersRepository,
    private readonly cacheService: CacheService,
  ) {}

  private buildGeoserverTileUrl(workspace: string, layerName: string) {
    const base = (process.env.GEOSERVER_PUBLIC_URL ?? process.env.GEOSERVER_URL ?? '').replace(
      /\/$/,
      '',
    );
    if (!base) {
      return null;
    }
    const serviceUrl = `${base}/wms`;
    return `${serviceUrl}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=${workspace}:${layerName}&STYLES=&FORMAT=image/png&TRANSPARENT=true&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;
  }

  private buildLegendUrl(workspace: string, layerName: string) {
    const base = (process.env.GEOSERVER_PUBLIC_URL ?? process.env.GEOSERVER_URL ?? '').replace(
      /\/$/,
      '',
    );
    if (!base) {
      return null;
    }
    const serviceUrl = `${base}/wms`;
    return `${serviceUrl}?SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=${workspace}:${layerName}`;
  }

  private toResponse(layer: LayerDocument): LayerResponse {
    const plain = layer.toObject() as Layer & { _id: unknown };
    const response: LayerResponse = {
      ...plain,
      id: String(plain._id),
    };
    if (layer.source === 'geoserver' && layer.geoserver) {
      response.tileUrl = this.buildGeoserverTileUrl(
        layer.geoserver.workspace,
        layer.geoserver.layerName,
      ) ?? undefined;
      response.legendUrl = this.buildLegendUrl(
        layer.geoserver.workspace,
        layer.geoserver.layerName,
      ) ?? undefined;
    }
    return response;
  }

  async list(tenantId: string) {
    const cacheKey = `layers:${tenantId}`;
    const cached = await this.cacheService.get<LayerResponse[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const layers = await this.layersRepository.list(tenantId);
    const data = layers.map((layer) => this.toResponse(layer));
    await this.cacheService.set(cacheKey, data, 30);
    return data;
  }

  async update(tenantId: string, id: string, dto: UpdateLayerDto) {
    const updated = await this.layersRepository.update(tenantId, id, dto);
    await this.cacheService.invalidateByPrefix(`layers:${tenantId}`);
    return updated;
  }

  async importLayer(tenantId: string, dto: ImportLayerDto) {
    const layer = await this.layersRepository.create({
      tenantId: asObjectId(tenantId),
      name: dto.name,
      group: dto.group,
      type: 'vector',
      source: dto.sourceType === 'geojson_url' ? 'external' : 'external',
      tileUrl: dto.sourceUrl,
      dataUrl: dto.sourceUrl,
      geometryType: dto.geometryType as LayerGeometryType || 'polygon',
      style: dto.style ? {
        fillColor: dto.style.fillColor || '#808080',
        lineColor: dto.style.lineColor || '#000000',
        lineWidth: dto.style.lineWidth || 1,
        labelField: dto.style.labelField,
      } : undefined,
      opacity: dto.opacity ?? 0.7,
      visible: dto.visible ?? true,
      order: dto.order ?? 0,
    });
    await this.cacheService.invalidateByPrefix(`layers:${tenantId}`);
    return this.toResponse(layer);
  }

  async bulkImportLayers(tenantId: string, dto: BulkImportLayersDto) {
    const results = {
      imported: 0,
      errors: 0,
      errorDetails: [] as Array<{ layer: string; message: string }>,
    };

    for (const layerDto of dto.layers) {
      try {
        await this.importLayer(tenantId, layerDto);
        results.imported++;
      } catch (err: any) {
        results.errors++;
        results.errorDetails.push({
          layer: layerDto.name,
          message: err?.message || 'Erro ao importar',
        });
        this.logger.error(`Error importing layer ${layerDto.name}: ${err?.message}`);
      }
    }

    return results;
  }

  async importSpZoneamentoLayers(tenantId: string) {
    const saoPauloZoneamentoLayers: ImportLayerDto[] = [
      {
        name: 'Zona Urbana',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/01A_Zona_Urbana.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#A0A0A0', fillOpacity: 0.5, lineColor: '#606060', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 10,
      },
      {
        name: 'Zona Rural',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/01A_Zona_Rural.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#90EE90', fillOpacity: 0.5, lineColor: '#228B22', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 11,
      },
      {
        name: 'Macrozona Estruturação Qualificação Urbana',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/01_Macrozona_Estruturacao_Qualificacao_Urbana.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FFD700', fillOpacity: 0.4, lineColor: '#DAA520', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 20,
      },
      {
        name: 'Macrozona Proteção Recuperação Ambiental',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/01_Macrozona_Protecao_Recuperacao_Ambiental.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#228B22', fillOpacity: 0.4, lineColor: '#006400', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 21,
      },
      {
        name: 'Subsetores Arco Jacu-Pessego',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Arco_Jacu-Pessego.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#87CEEB', fillOpacity: 0.4, lineColor: '#4682B4', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 22,
      },
      {
        name: 'Subsetores Arco Jurubatuba',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Arco_Jurubatuba.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#87CEEB', fillOpacity: 0.4, lineColor: '#4682B4', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 23,
      },
      {
        name: 'Subsetores Arco Leste',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Arco_Leste.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#87CEEB', fillOpacity: 0.4, lineColor: '#4682B4', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 24,
      },
      {
        name: 'Subsetores Arco Pinheiros',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Arco_Pinheiros.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#87CEEB', fillOpacity: 0.4, lineColor: '#4682B4', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 25,
      },
      {
        name: 'Subsetores Arco Tamanduateí',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Arco_Tamanduatei.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#87CEEB', fillOpacity: 0.4, lineColor: '#4682B4', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 26,
      },
      {
        name: 'Subsetores Arco Tietê',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Arco_Tiete.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#87CEEB', fillOpacity: 0.4, lineColor: '#4682B4', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 27,
      },
      {
        name: 'Subsetores Central',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Central.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FFD700', fillOpacity: 0.4, lineColor: '#DAA520', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 28,
      },
      {
        name: 'Subsetores Eixo Cupecê',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Eixo_Cupece.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#DDA0DD', fillOpacity: 0.4, lineColor: '#9932CC', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 29,
      },
      {
        name: 'Subsetores Eixo Fernão Dias',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Eixo_FernaoDias.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#DDA0DD', fillOpacity: 0.4, lineColor: '#9932CC', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 30,
      },
      {
        name: 'Subsetores Eixo Noroeste',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_Eixo_Noroeste.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#DDA0DD', fillOpacity: 0.4, lineColor: '#9932CC', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 31,
      },
      {
        name: 'Subsetores Faria Lima-Aguas Espraiadas',
        group: 'Subsetores SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02A_Subsetores_FariaLima-AguasEspraiadas-ChucriZaidan.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#DDA0DD', fillOpacity: 0.4, lineColor: '#9932CC', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 32,
      },
      {
        name: 'Macroarea Contenção Urbana',
        group: 'Macroareas SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02_Macroarea_Contencao_Urbana_Uso_Sustentavel.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#8FBC8F', fillOpacity: 0.4, lineColor: '#2E8B2E', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 33,
      },
      {
        name: 'Macroarea Controle Qualificação Urbana Ambiental',
        group: 'Macroareas SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02_Macroarea_Controle_Qualificacao_Urbana_Ambiental.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#8FBC8F', fillOpacity: 0.4, lineColor: '#2E8B2E', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 34,
      },
      {
        name: 'Macroarea Estruturação Metropolitana',
        group: 'Macroareas SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02_Macroarea_Estruturacao_Metropolitana.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#8FBC8F', fillOpacity: 0.4, lineColor: '#2E8B2E', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 35,
      },
      {
        name: 'Macroarea Preservação Ecossistemas Naturais',
        group: 'Macroareas SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02_Macroarea_Preservacao_Ecossistemas_Naturais.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#228B22', fillOpacity: 0.4, lineColor: '#006400', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 36,
      },
      {
        name: 'Macroarea Qualificação Urbanização',
        group: 'Macroareas SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02_Macroarea_Qualificacao_Urbanizacao.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#8FBC8F', fillOpacity: 0.4, lineColor: '#2E8B2E', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 37,
      },
      {
        name: 'Macroarea Redução Vulnerabilidade Urbana',
        group: 'Macroareas SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02_Macroarea_Reducao_Vulnerabilidade_Urbana.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FFA07A', fillOpacity: 0.4, lineColor: '#FF6347', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 38,
      },
      {
        name: 'Macroarea Urbanização Consolidada',
        group: 'Macroareas SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/02_Macroarea_Urbanizacao_Consolidada.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#D3D3D3', fillOpacity: 0.4, lineColor: '#A9A9A9', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 39,
      },
      {
        name: 'ZEIS 1',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/04_ZEIS1.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FF69B4', fillOpacity: 0.5, lineColor: '#C71585', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 40,
      },
      {
        name: 'ZEIS 2',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/04A_ZEIS2.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FF1493', fillOpacity: 0.5, lineColor: '#C71585', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 41,
      },
      {
        name: 'ZEIS 3',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/04A_ZEIS3.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#DB7093', fillOpacity: 0.5, lineColor: '#C71585', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 42,
      },
      {
        name: 'ZEIS 4',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/04A_ZEIS4.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FF69B4', fillOpacity: 0.5, lineColor: '#C71585', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 43,
      },
      {
        name: 'ZEIS 5',
        group: 'Zoneamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/04A_ZEIS5.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FF1493', fillOpacity: 0.5, lineColor: '#C71585', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 44,
      },
      {
        name: 'Bacias Hidrográficas',
        group: 'Meio Ambiente SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/05_Bacias_Hidrograficas.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#4169E1', fillOpacity: 0.3, lineColor: '#191970', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 45,
      },
      {
        name: 'Hidrografia Ríos',
        group: 'Meio Ambiente SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/05_Hidrografia_Rios.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#4169E1', lineColor: '#4169E1', lineWidth: 2 },
        opacity: 0.8,
        visible: true,
        order: 46,
      },
      {
        name: 'Parques Estaduais Proteção Integral',
        group: 'Meio Ambiente SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/05_Parques_Estaduais_Protecao_Integral.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#006400', fillOpacity: 0.6, lineColor: '#004d00', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 47,
      },
      {
        name: 'Parques Estaduais Urbanos',
        group: 'Meio Ambiente SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/05_Parques_Estaduais_Urbanos.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#32CD32', fillOpacity: 0.6, lineColor: '#228B22', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 48,
      },
      {
        name: 'Parques Municipais',
        group: 'Meio Ambiente SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/05_Parques_Municipais_existentes.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#32CD32', fillOpacity: 0.6, lineColor: '#228B22', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 49,
      },
      {
        name: 'Parques Municipais Implantação',
        group: 'Meio Ambiente SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/05_Parques_Municipais_implantacao.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#90EE90', fillOpacity: 0.5, lineColor: '#228B22', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 50,
      },
      {
        name: 'Parques Municipais Planejamento',
        group: 'Meio Ambiente SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/05_Parques_Municipais_planejamento.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#98FB98', fillOpacity: 0.5, lineColor: '#228B22', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 51,
      },
      {
        name: 'Adutora Planejada',
        group: 'Abastecimento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/06_Adutora_Planejada.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#1E90FF', lineColor: '#1E90FF', lineWidth: 2 },
        opacity: 0.7,
        visible: false,
        order: 60,
      },
      {
        name: 'Centro Reservação Planejado',
        group: 'Abastecimento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/06_Centro_Reservacao_Planejado.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#1E90FF', lineColor: '#0000CD', lineWidth: 1 },
        opacity: 0.7,
        visible: false,
        order: 61,
      },
      {
        name: 'Estação Tratamento Água Existente',
        group: 'Abastecimento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/06_Estacao_Tratamento_Agua_Existente.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#1E90FF', lineColor: '#0000CD', lineWidth: 1 },
        opacity: 0.7,
        visible: false,
        order: 62,
      },
      {
        name: 'Sistema Adutor Metropolitano Existente',
        group: 'Abastecimento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/06_Sistema_Adutor_Metropolitano_Existente.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#1E90FF', lineColor: '#1E90FF', lineWidth: 2 },
        opacity: 0.7,
        visible: false,
        order: 63,
      },
      {
        name: 'Coletor Tronco Existente',
        group: 'Esgotamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/07_Coletor_Tronco_Existente.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#8B4513', lineColor: '#8B4513', lineWidth: 2 },
        opacity: 0.7,
        visible: false,
        order: 70,
      },
      {
        name: 'Interceptor Existente',
        group: 'Esgotamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/07_Interceptor_Existente.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#A0522D', lineColor: '#A0522D', lineWidth: 2 },
        opacity: 0.7,
        visible: false,
        order: 71,
      },
      {
        name: 'Estação Tratamento Esgoto Existente',
        group: 'Esgotamento SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/07_Estacao_Tratamento_Esgoto_Existente.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#8B4513', lineColor: '#5D3A1A', lineWidth: 1 },
        opacity: 0.7,
        visible: false,
        order: 72,
      },
      {
        name: 'Melhoramentos Viários',
        group: 'Viário SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/08_Melhoramentos_Viarios_abrir.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#FF8C00', lineColor: '#FF8C00', lineWidth: 2 },
        opacity: 0.7,
        visible: false,
        order: 80,
      },
      {
        name: 'Rodoanel',
        group: 'Viário SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/08_Rodoanel.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#FF4500', lineColor: '#FF4500', lineWidth: 3 },
        opacity: 0.8,
        visible: true,
        order: 81,
      },
      {
        name: 'Eixo Estruturante Existente',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/03_Eixo_Existente.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#0000FF', lineColor: '#0000FF', lineWidth: 3 },
        opacity: 0.8,
        visible: true,
        order: 90,
      },
      {
        name: 'Eixo Previsto',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/03A_Eixo_Previsto.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#4169E1', lineColor: '#4169E1', lineWidth: 2 },
        opacity: 0.6,
        visible: false,
        order: 91,
      },
      {
        name: 'Corredor Ônibus Municipal Existente',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/09_Corredor_onibus_municipal_existente.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#FFD700', lineColor: '#FFD700', lineWidth: 2 },
        opacity: 0.7,
        visible: true,
        order: 92,
      },
      {
        name: 'Metro - Linha Existente',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/09_Metro_Linha_Existente.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#FF0000', lineColor: '#FF0000', lineWidth: 2 },
        opacity: 0.9,
        visible: true,
        order: 93,
      },
      {
        name: 'Metro - Linha Planejada',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/09_Metro_Linha_Planejada_2016.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#FF6347', lineColor: '#FF6347', lineWidth: 2 },
        opacity: 0.7,
        visible: false,
        order: 94,
      },
      {
        name: 'Estações Metro Existentes',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/09_Metro_Estacao_Existente.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#FF0000', lineColor: '#8B0000', lineWidth: 1 },
        opacity: 0.9,
        visible: true,
        order: 95,
      },
      {
        name: 'Estações Metro Planejadas',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/09_Metro_Estacao_Planejada_2016.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#FF6347', lineColor: '#8B0000', lineWidth: 1 },
        opacity: 0.7,
        visible: false,
        order: 96,
      },
      {
        name: 'Monotrilho Linha Planejada',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/09_Monotrilho_Linha_Planejada_2016.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#9370DB', lineColor: '#9370DB', lineWidth: 2 },
        opacity: 0.7,
        visible: false,
        order: 97,
      },
      {
        name: 'Trem - Linha Existente',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/09_Trem_Linha_Existente.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#8B0000', lineColor: '#8B0000', lineWidth: 2 },
        opacity: 0.8,
        visible: true,
        order: 98,
      },
      {
        name: 'Terminal Ônibus Existente',
        group: 'Mobilidade SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/09_Terminal_onibus_existente.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#FFD700', lineColor: '#B8860B', lineWidth: 1 },
        opacity: 0.8,
        visible: true,
        order: 99,
      },
      {
        name: 'Áreas de Risco Geológico',
        group: 'Habitação SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/10_Areas_Risco_Geologico_Assentamento_Precario.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FF4500', fillOpacity: 0.5, lineColor: '#8B0000', lineWidth: 1 },
        opacity: 0.7,
        visible: true,
        order: 100,
      },
      {
        name: 'Eixo CUPI',
        group: 'Eixos SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/11_Cupece.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FFD700', fillOpacity: 0.4, lineColor: '#DAA520', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 110,
      },
      {
        name: 'Eixo Fernão Dias',
        group: 'Eixos SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/11_Fernao_Dias.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FFD700', fillOpacity: 0.4, lineColor: '#DAA520', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 111,
      },
      {
        name: 'Eixo Jacu-Pessego',
        group: 'Eixos SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/11_Jacu_Pessego.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FFD700', fillOpacity: 0.4, lineColor: '#DAA520', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 112,
      },
      {
        name: 'Equipamentos Educação',
        group: 'Equipamentos SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/13_Educacao.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#4169E1', lineColor: '#191970', lineWidth: 1 },
        opacity: 0.8,
        visible: true,
        order: 120,
      },
      {
        name: 'Equipamentos Saúde',
        group: 'Equipamentos SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/13_Saude.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#FF0000', lineColor: '#8B0000', lineWidth: 1 },
        opacity: 0.8,
        visible: true,
        order: 121,
      },
      {
        name: 'Equipamentos Cultura',
        group: 'Equipamentos SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/13_Cultura.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#9400D3', lineColor: '#4B0082', lineWidth: 1 },
        opacity: 0.8,
        visible: true,
        order: 122,
      },
      {
        name: 'Equipamentos Esporte e Lazer',
        group: 'Equipamentos SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/13_Esporte_e_Lazer.geojson',
        sourceType: 'external',
        geometryType: 'point',
        style: { fillColor: '#32CD32', lineColor: '#006400', lineWidth: 1 },
        opacity: 0.8,
        visible: true,
        order: 123,
      },
      {
        name: 'APA',
        group: 'Proteção SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/14_APA_Estadual.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#228B22', fillOpacity: 0.4, lineColor: '#006400', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 130,
      },
      {
        name: 'Área Proteção Mananciais RMSP',
        group: 'Proteção SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/14_Area_Protecao_Recuperacao_Mananciais_RMSP.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#006400', fillOpacity: 0.4, lineColor: '#004d00', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 131,
      },
      {
        name: 'Terra Indígena',
        group: 'Proteção SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/15_Terra_Indigena_Existente.geojson',
        sourceType: 'external',
        geometryType: 'polygon',
        style: { fillColor: '#FF8C00', fillOpacity: 0.4, lineColor: '#8B4513', lineWidth: 1 },
        opacity: 0.6,
        visible: true,
        order: 132,
      },
      {
        name: 'Viário Estrutural N1',
        group: 'Viário SP',
        sourceUrl: 'https://nucleo-digital.github.io/sp-mapas/15_Viario_Estrutural_N1.geojson',
        sourceType: 'external',
        geometryType: 'line',
        style: { fillColor: '#2F4F4F', lineColor: '#2F4F4F', lineWidth: 3 },
        opacity: 0.8,
        visible: true,
        order: 140,
      },
    ];

    const result = await this.bulkImportLayers(tenantId, { layers: saoPauloZoneamentoLayers });
    return result;
  }
}
