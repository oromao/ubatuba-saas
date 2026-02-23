import { BadRequestException, Injectable } from '@nestjs/common';
import { FacesRepository } from './faces.repository';
import { CreateFaceDto } from './dto/create-face.dto';
import { UpdateFaceDto } from './dto/update-face.dto';
import { isLineGeometry } from '../../../common/utils/geo';
import { ProjectsService } from '../../projects/projects.service';
import { asObjectId } from '../../../common/utils/object-id';

type FaceGeoJson = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
};

@Injectable()
export class FacesService {
  constructor(
    private readonly repository: FacesRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async list(tenantId: string, projectId?: string, bbox?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.list(tenantId, String(resolvedProjectId), bbox);
  }

  async findById(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.repository.findById(tenantId, String(resolvedProjectId), id);
  }

  async create(tenantId: string, dto: CreateFaceDto, userId?: string) {
    if (!isLineGeometry(dto.geometry)) {
      throw new BadRequestException('Geometria invalida para face de quadra');
    }
    const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    const code = dto.code;
    const zoneId = dto.zoneId ?? dto.zonaValorId;
    const landValuePerSqm = dto.landValuePerSqm ?? dto.valorTerrenoM2;
    if (!code) {
      throw new BadRequestException('Codigo da face e obrigatorio');
    }
    if (landValuePerSqm === undefined) {
      throw new BadRequestException('Valor do terreno por m2 e obrigatorio');
    }
    const metadados = dto.metadados ?? {
      lado: dto.lado,
      trecho: dto.trecho,
      observacoes: dto.observacoes,
    };
    return this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId,
      code,
      logradouroId: dto.logradouroId ? asObjectId(dto.logradouroId) : undefined,
      zoneId: zoneId ? asObjectId(zoneId) : undefined,
      zonaValorId: zoneId ? asObjectId(zoneId) : undefined,
      landValuePerSqm,
      valorTerrenoM2: dto.valorTerrenoM2 ?? landValuePerSqm,
      metadados,
      geometry: dto.geometry,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }

  async update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateFaceDto) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const zoneId = dto.zoneId ?? dto.zonaValorId;
    const landValuePerSqm = dto.landValuePerSqm ?? dto.valorTerrenoM2;
    const metadados = dto.metadados ?? {
      lado: dto.lado,
      trecho: dto.trecho,
      observacoes: dto.observacoes,
    };
    const update: Record<string, unknown> = {};
    if (dto.code) update.code = dto.code;
    if (dto.logradouroId) update.logradouroId = asObjectId(dto.logradouroId);
    if (zoneId) {
      update.zoneId = asObjectId(zoneId);
      update.zonaValorId = asObjectId(zoneId);
    }
    if (landValuePerSqm !== undefined) {
      update.landValuePerSqm = landValuePerSqm;
      update.valorTerrenoM2 = dto.valorTerrenoM2 ?? landValuePerSqm;
    }
    if (metadados) {
      update.metadados = metadados;
    }
    if (dto.geometry) {
      if (!isLineGeometry(dto.geometry)) {
        throw new BadRequestException('Geometria invalida para face de quadra');
      }
      update.geometry = dto.geometry;
    }
    return this.repository.update(tenantId, String(resolvedProjectId), id, update);
  }

  async remove(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    await this.repository.delete(tenantId, String(resolvedProjectId), id);
    return { success: true };
  }

  async geojson(tenantId: string, projectId?: string, bbox?: string): Promise<FaceGeoJson> {
    const faces = await this.list(tenantId, projectId, bbox);
    return {
      type: 'FeatureCollection',
      features: faces.map((face) => ({
        type: 'Feature',
        id: face.id,
        geometry: face.geometry,
        properties: {
          featureType: 'face',
          faceId: face.id,
          code: face.code,
          landValuePerSqm: face.landValuePerSqm,
          valorTerrenoM2: face.valorTerrenoM2 ?? face.landValuePerSqm,
        },
      })),
    };
  }

  async importGeojson(
    tenantId: string,
    projectId: string | undefined,
    featureCollection: FaceGeoJson,
    userId?: string,
  ) {
    if (!featureCollection?.features?.length) {
      return { inserted: 0, errors: 0 };
    }
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    let inserted = 0;
    let errors = 0;

    for (const feature of featureCollection.features) {
      const geometry = feature.geometry;
      if (!isLineGeometry(geometry)) {
        errors += 1;
        continue;
      }
      const props = feature.properties ?? {};
      const code = String(props.code ?? props.COD ?? '').trim();
      const landValuePerSqm = Number(
        props.landValuePerSqm ?? props.valorTerrenoM2 ?? props.valor_m2 ?? 0,
      );
      if (!code) {
        errors += 1;
        continue;
      }
      try {
        await this.repository.create({
          tenantId: asObjectId(tenantId),
          projectId: resolvedProjectId,
          code,
          landValuePerSqm,
          valorTerrenoM2: landValuePerSqm,
          geometry,
          createdBy: userId ? asObjectId(userId) : undefined,
        });
        inserted += 1;
      } catch {
        errors += 1;
      }
    }

    return { inserted, errors };
  }
}
