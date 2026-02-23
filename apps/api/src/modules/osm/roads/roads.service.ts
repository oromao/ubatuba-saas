import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../../projects/projects.service';
import { RoadsRepository } from './roads.repository';

type RoadGeoJson = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
};

@Injectable()
export class RoadsService {
  constructor(
    private readonly repository: RoadsRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(tenantId: string, projectId?: string, bbox?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProjectId), bbox);
  }

  async geojson(tenantId: string, projectId?: string, bbox?: string): Promise<RoadGeoJson> {
    const roads = await this.list(tenantId, projectId, bbox);
    return {
      type: 'FeatureCollection',
      features: roads.map((road) => ({
        type: 'Feature',
        id: road.id,
        geometry: road.geometry,
        properties: {
          featureType: 'road',
          roadId: road.id,
          name: road.name,
          nome: road.nome ?? road.name,
          highway: road.highway,
          tipo: road.tipo ?? road.highway,
        },
      })),
    };
  }
}
