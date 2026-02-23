import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../../projects/projects.service';
import { BuildingsRepository } from './buildings.repository';

type BuildingGeoJson = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
};

@Injectable()
export class BuildingsService {
  constructor(
    private readonly repository: BuildingsRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(tenantId: string, projectId?: string, bbox?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProjectId), bbox);
  }

  async geojson(tenantId: string, projectId?: string, bbox?: string): Promise<BuildingGeoJson> {
    const buildings = await this.list(tenantId, projectId, bbox);
    return {
      type: 'FeatureCollection',
      features: buildings.map((building) => ({
        type: 'Feature',
        id: building.id,
        geometry: building.geometry,
        properties: {
          featureType: 'building',
          buildingId: building.id,
          name: building.name,
          nome: building.nome ?? building.name,
          building: building.building,
          tipo: building.tipo ?? building.building,
        },
      })),
    };
  }
}
