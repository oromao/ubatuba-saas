import { Injectable } from '@nestjs/common';
import { CacheService } from '../shared/cache.service';
import { AreasRepository } from './areas.repository';

type FeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: Record<string, unknown>;
  }>;
};

@Injectable()
export class AreasService {
  constructor(
    private readonly areasRepository: AreasRepository,
    private readonly cacheService: CacheService,
  ) {}

  async list(tenantId: string, group?: string): Promise<FeatureCollection> {
    const cacheKey = `areas:${tenantId}:${group ?? 'all'}`;
    const cached = await this.cacheService.get<FeatureCollection>(cacheKey);
    if (cached) {
      return cached;
    }

    const areas = await this.areasRepository.list(tenantId, group);
    const data: FeatureCollection = {
      type: 'FeatureCollection',
      features: areas.map((area) => ({
        type: 'Feature',
        id: area.id,
        geometry: area.geometry,
        properties: {
          name: area.name,
          group: area.group,
          color: area.color,
        },
      })),
    };

    await this.cacheService.set(cacheKey, data, 30);
    return data;
  }
}
