import { BadRequestException, Injectable } from '@nestjs/common';
import { MapFeaturesRepository } from './map-features.repository';
import { CreateMapFeatureDto } from './dto/create-map-feature.dto';
import { UpdateMapFeatureDto } from './dto/update-map-feature.dto';
import { isPolygonGeometry } from '../../common/utils/geo';
import { asObjectId } from '../../common/utils/object-id';
import { ProjectsService } from '../projects/projects.service';
import { TenantsService } from '../tenants/tenants.service';
import { MapFeatureDocument, MapFeatureType } from './map-feature.schema';

const FEATURE_TYPES = new Set<MapFeatureType>(['parcel', 'building']);

const normalizeFeatureType = (value?: string): MapFeatureType => {
  if (!value || !FEATURE_TYPES.has(value as MapFeatureType)) {
    throw new BadRequestException('Tipo de feature invalido');
  }
  return value as MapFeatureType;
};

const parseBbox = (bbox?: string) => {
  if (!bbox) return undefined;
  const parts = bbox.split(',').map((item) => Number(item.trim()));
  if (parts.length !== 4 || parts.some((value) => Number.isNaN(value))) {
    throw new BadRequestException('BBOX invalido');
  }
  return bbox;
};

const normalizeProperties = (value?: Record<string, unknown>) => {
  if (!value || typeof value !== 'object') return {};
  return { ...value };
};

const ensureStatus = (properties: Record<string, unknown>) => {
  const status = properties.status;
  if (typeof status === 'string' && status.trim().length > 0) {
    return properties;
  }
  return { ...properties, status: 'ATIVO' };
};

@Injectable()
export class MapFeaturesService {
  constructor(
    private readonly repository: MapFeaturesRepository,
    private readonly projectsService: ProjectsService,
    private readonly tenantsService: TenantsService,
  ) {}

  private toResponse(doc: MapFeatureDocument) {
    const plain = doc.toObject() as MapFeatureDocument & { _id: unknown };
    return {
      ...plain,
      id: String(plain._id),
    };
  }

  async create(tenantId: string, dto: CreateMapFeatureDto, userId?: string) {
    if (!isPolygonGeometry(dto.geometry)) {
      throw new BadRequestException('Geometria invalida');
    }
    const featureType = normalizeFeatureType(dto.featureType);
    const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    const [tenant, project] = await Promise.all([
      this.tenantsService.findById(tenantId),
      this.projectsService.findById(tenantId, String(projectId)),
    ]);
    const properties = ensureStatus(normalizeProperties(dto.properties));

    const created = await this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId,
      tenantSlug: tenant?.slug,
      projectSlug: project?.slug,
      featureType,
      properties,
      geometry: dto.geometry,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
    return this.toResponse(created);
  }

  async update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateMapFeatureDto, userId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const update: Record<string, unknown> = {
      updatedBy: userId ? asObjectId(userId) : undefined,
    };
    if (dto.geometry) {
      if (!isPolygonGeometry(dto.geometry)) {
        throw new BadRequestException('Geometria invalida');
      }
      update.geometry = dto.geometry;
    }
    if (dto.properties) {
      update.properties = ensureStatus(normalizeProperties(dto.properties));
    }
    const updated = await this.repository.update(tenantId, String(resolvedProjectId), id, update);
    if (!updated) {
      throw new BadRequestException('Feature nao encontrada');
    }
    return this.toResponse(updated);
  }

  async remove(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    await this.repository.delete(tenantId, String(resolvedProjectId), id);
    return { success: true };
  }

  async geojson(tenantId: string, projectId: string | undefined, featureType?: string, bbox?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const parsedBbox = parseBbox(bbox);
    const parsedType = featureType ? normalizeFeatureType(featureType) : undefined;
    const features = await this.repository.list(
      tenantId,
      String(resolvedProjectId),
      parsedType,
      parsedBbox,
    );
    return {
      type: 'FeatureCollection',
      features: features.map((feature) => ({
        type: 'Feature',
        id: feature.id,
        geometry: feature.geometry,
        properties: {
          ...(feature.properties ?? {}),
          mapFeatureId: feature.id,
          featureType: feature.featureType,
        },
      })),
    };
  }
}
