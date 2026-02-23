import { Injectable } from '@nestjs/common';
import { CacheService } from '../shared/cache.service';
import { Layer, LayerDocument } from './layer.schema';
import { LayersRepository } from './layers.repository';
import { UpdateLayerDto } from './dto/update-layer.dto';

type LayerResponse = Layer & {
  id: string;
  legendUrl?: string;
  tileUrl?: string;
};

@Injectable()
export class LayersService {
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
}
