import { BadRequestException, Injectable } from '@nestjs/common';
import { ZonesRepository } from './zones.repository';
import { CreateZoneDto } from './dto/create-zone.dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { ProjectsService } from '../../projects/projects.service';
import { isPolygonGeometry } from '../../../common/utils/geo';
import { asObjectId } from '../../../common/utils/object-id';

type ZoneGeoJson = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
};

@Injectable()
export class ZonesService {
  constructor(
    private readonly repository: ZonesRepository,
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

  async create(tenantId: string, dto: CreateZoneDto, userId?: string) {
    if (!isPolygonGeometry(dto.geometry)) {
      throw new BadRequestException('Geometria invalida para zona');
    }
    const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    const code = dto.code ?? dto.codigo;
    const name = dto.name ?? dto.nome;
    const description = dto.description ?? dto.descricao;
    const baseLandValue = dto.baseLandValue ?? dto.valorBaseTerrenoM2;
    const baseConstructionValue = dto.baseConstructionValue ?? dto.valorBaseConstrucaoM2;
    if (!code || !name) {
      throw new BadRequestException('Codigo e nome sao obrigatorios');
    }
    if (baseLandValue === undefined || baseConstructionValue === undefined) {
      throw new BadRequestException('Valores base sao obrigatorios');
    }
    return this.repository.create({
      tenantId: asObjectId(tenantId),
      projectId,
      code,
      name,
      description,
      nome: dto.nome ?? name,
      descricao: dto.descricao ?? description,
      baseLandValue,
      baseConstructionValue,
      valorBaseTerrenoM2: dto.valorBaseTerrenoM2 ?? baseLandValue,
      valorBaseConstrucaoM2: dto.valorBaseConstrucaoM2 ?? baseConstructionValue,
      geometry: dto.geometry,
      createdBy: userId ? asObjectId(userId) : undefined,
    });
  }

  async update(tenantId: string, projectId: string | undefined, id: string, dto: UpdateZoneDto) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const code = dto.code ?? dto.codigo;
    const name = dto.name ?? dto.nome;
    const description = dto.description ?? dto.descricao;
    const baseLandValue = dto.baseLandValue ?? dto.valorBaseTerrenoM2;
    const baseConstructionValue = dto.baseConstructionValue ?? dto.valorBaseConstrucaoM2;
    const update: Record<string, unknown> = {};
    if (code) {
      update.code = code;
      update.codigo = dto.codigo ?? code;
    }
    if (name) {
      update.name = name;
      update.nome = dto.nome ?? name;
    }
    if (description !== undefined) {
      update.description = description;
      update.descricao = dto.descricao ?? description;
    }
    if (baseLandValue !== undefined) {
      update.baseLandValue = baseLandValue;
      update.valorBaseTerrenoM2 = dto.valorBaseTerrenoM2 ?? baseLandValue;
    }
    if (baseConstructionValue !== undefined) {
      update.baseConstructionValue = baseConstructionValue;
      update.valorBaseConstrucaoM2 = dto.valorBaseConstrucaoM2 ?? baseConstructionValue;
    }
    if (dto.geometry) {
      if (!isPolygonGeometry(dto.geometry)) {
        throw new BadRequestException('Geometria invalida para zona');
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

  async geojson(tenantId: string, projectId?: string, bbox?: string): Promise<ZoneGeoJson> {
    const zones = await this.list(tenantId, projectId, bbox);
    return {
      type: 'FeatureCollection',
      features: zones.map((zone) => ({
        type: 'Feature',
        id: zone.id,
        geometry: zone.geometry,
        properties: {
          featureType: 'zone',
          zoneId: zone.id,
          code: zone.code,
          name: zone.name,
          nome: zone.nome ?? zone.name,
          baseLandValue: zone.baseLandValue,
          baseConstructionValue: zone.baseConstructionValue,
          valorBaseTerrenoM2: zone.valorBaseTerrenoM2 ?? zone.baseLandValue,
          valorBaseConstrucaoM2: zone.valorBaseConstrucaoM2 ?? zone.baseConstructionValue,
        },
      })),
    };
  }

  async importGeojson(
    tenantId: string,
    projectId: string | undefined,
    featureCollection: ZoneGeoJson,
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
      if (!isPolygonGeometry(geometry)) {
        errors += 1;
        continue;
      }
      const props = feature.properties ?? {};
      const code = String(props.code ?? props.codigo ?? props.COD ?? '').trim();
      const name = String(props.name ?? props.nome ?? props.NOME ?? '').trim();
      const baseLandValue = Number(
        props.baseLandValue ?? props.valorBaseTerrenoM2 ?? props.valor_terreno ?? 0,
      );
      const baseConstructionValue = Number(
        props.baseConstructionValue ??
          props.valorBaseConstrucaoM2 ??
          props.valor_construcao ??
          0,
      );
      if (!code || !name) {
        errors += 1;
        continue;
      }
      try {
        await this.repository.create({
          tenantId: asObjectId(tenantId),
          projectId: resolvedProjectId,
          code,
          name,
          description: String(props.description ?? props.descricao ?? ''),
          nome: String(props.nome ?? name),
          descricao: String(props.descricao ?? props.description ?? ''),
          baseLandValue,
          baseConstructionValue,
          valorBaseTerrenoM2: baseLandValue,
          valorBaseConstrucaoM2: baseConstructionValue,
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
