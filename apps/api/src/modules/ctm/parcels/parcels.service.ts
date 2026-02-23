import { BadRequestException, Injectable } from '@nestjs/common';
import { calculateGeometryArea, isPolygonGeometry } from '../../../common/utils/geo';
import { asObjectId } from '../../../common/utils/object-id';
import { ProjectsService } from '../../projects/projects.service';
import { ParcelBuildingsService } from '../parcel-buildings/parcel-buildings.service';
import { ParcelInfrastructureService } from '../parcel-infrastructure/parcel-infrastructure.service';
import { ParcelSocioeconomicService } from '../parcel-socioeconomic/parcel-socioeconomic.service';
import { LogradourosService } from '../logradouros/logradouros.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ParcelAuditRepository } from './parcel-audit.repository';
import { ParcelsRepository } from './parcels.repository';

type ParcelGeoJson = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id: string;
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
};

const STATUS_VALUES = new Set(['ATIVO', 'INATIVO', 'CONFLITO']);

const parseStatus = (value?: string): 'ATIVO' | 'INATIVO' | 'CONFLITO' | undefined =>
  value && STATUS_VALUES.has(value) ? (value as 'ATIVO' | 'INATIVO' | 'CONFLITO') : undefined;

const normalizeStatus = (value?: string): 'ATIVO' | 'INATIVO' | 'CONFLITO' =>
  parseStatus(value) ?? 'ATIVO';

const WORKFLOW_VALUES = new Set(['PENDENTE', 'EM_VALIDACAO', 'APROVADA', 'REPROVADA']);

const normalizeWorkflowStatus = (
  value?: string,
): 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA' =>
  (value && WORKFLOW_VALUES.has(value)
    ? value
    : 'PENDENTE') as 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA';

@Injectable()
export class ParcelsService {
  constructor(
    private readonly parcelsRepository: ParcelsRepository,
    private readonly projectsService: ProjectsService,
    private readonly parcelBuildingsService: ParcelBuildingsService,
    private readonly parcelSocioeconomicService: ParcelSocioeconomicService,
    private readonly parcelInfrastructureService: ParcelInfrastructureService,
    private readonly logradourosService: LogradourosService,
    private readonly parcelAuditRepository: ParcelAuditRepository,
  ) {}

  private computePendingIssues(parcel: {
    mainAddress?: string;
    enderecoPrincipal?: { logradouro?: string };
    inscricaoImobiliaria?: string;
    inscription?: string;
    geometry?: unknown;
    areaTerreno?: number;
    area?: number;
    status?: string;
    statusCadastral?: string;
  }) {
    const issues: string[] = [];
    const hasAddress = Boolean(parcel.mainAddress || parcel.enderecoPrincipal?.logradouro);
    const hasInscription = Boolean(parcel.inscricaoImobiliaria || parcel.inscription);
    const hasGeometry = Boolean(parcel.geometry);
    const hasArea = (parcel.areaTerreno ?? parcel.area ?? 0) > 0;
    const hasStatus = Boolean(parcel.status || parcel.statusCadastral);
    if (!hasAddress) issues.push('SEM_ENDERECO');
    if (!hasInscription) issues.push('SEM_INSCRICAO');
    if (!hasGeometry) issues.push('SEM_GEOMETRIA');
    if (!hasArea) issues.push('SEM_AREA');
    if (!hasStatus) issues.push('SEM_STATUS');
    return issues;
  }

  private buildDiff(before: Record<string, unknown>, after: Record<string, unknown>) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const diff: Record<string, { before: unknown; after: unknown }> = {};
    keys.forEach((key) => {
      const prev = before[key];
      const next = after[key];
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        diff[key] = { before: prev, after: next };
      }
    });
    return diff;
  }

  async list(
    tenantId: string,
    projectId?: string,
    filters?: {
      sqlu?: string;
      inscription?: string;
      inscricaoImobiliaria?: string;
      status?: string;
      workflowStatus?: string;
      bbox?: string;
      q?: string;
    },
  ) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.parcelsRepository.list(tenantId, {
      projectId: String(resolvedProjectId),
      sqlu: filters?.sqlu,
      inscription: filters?.inscription,
      inscricaoImobiliaria: filters?.inscricaoImobiliaria,
      status: filters?.status,
      workflowStatus: filters?.workflowStatus,
      bbox: filters?.bbox,
      q: filters?.q,
    });
  }

  async listPendencias(tenantId: string, projectId?: string) {
    const parcels = await this.list(tenantId, projectId, { workflowStatus: 'PENDENTE' });
    return parcels
      .map((parcel) => {
        const issues = parcel.pendingIssues?.length
          ? parcel.pendingIssues
          : this.computePendingIssues(parcel);
        return {
          parcelId: parcel.id,
          sqlu: parcel.sqlu,
          inscription: parcel.inscricaoImobiliaria ?? parcel.inscription,
          workflowStatus: parcel.workflowStatus ?? 'PENDENTE',
          pendingIssues: issues,
        };
      })
      .filter((item) => item.pendingIssues.length > 0 || item.workflowStatus === 'PENDENTE');
  }

  async findById(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
  }

  async getHistory(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.parcelAuditRepository.listByParcel(tenantId, String(resolvedProjectId), id);
  }

  async create(tenantId: string, dto: CreateParcelDto, userId?: string) {
    if (!isPolygonGeometry(dto.geometry)) {
      throw new BadRequestException('Geometria invalida para parcela');
    }
    const inscription = dto.inscricaoImobiliaria ?? dto.inscription;
    if (!inscription) {
      throw new BadRequestException('Inscricao imobiliaria obrigatoria');
    }
    const enderecoPrincipal = dto.enderecoPrincipal;
    const mainAddress =
      dto.mainAddress ??
      [enderecoPrincipal?.logradouro, enderecoPrincipal?.numero].filter(Boolean).join(', ');
    if (!mainAddress && !enderecoPrincipal) {
      throw new BadRequestException('Endereco principal obrigatorio');
    }
    const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
    const area = calculateGeometryArea(dto.geometry);
    const statusCadastral = normalizeStatus(dto.statusCadastral ?? dto.status);
    const pendingIssues = this.computePendingIssues({
      mainAddress,
      enderecoPrincipal,
      inscricaoImobiliaria: inscription,
      inscription,
      geometry: dto.geometry,
      areaTerreno: area,
      area,
      status: dto.status ?? dto.statusCadastral ?? statusCadastral,
      statusCadastral,
    });
    const workflowStatus = dto.workflowStatus
      ? normalizeWorkflowStatus(dto.workflowStatus)
      : pendingIssues.length > 0
        ? 'PENDENTE'
        : 'APROVADA';

    const created = await this.parcelsRepository.create({
      tenantId: asObjectId(tenantId),
      projectId,
      sqlu: dto.sqlu,
      inscricaoImobiliaria: inscription,
      inscription,
      enderecoPrincipal,
      mainAddress: mainAddress || undefined,
      statusCadastral,
      status: dto.status ?? dto.statusCadastral ?? statusCadastral,
      observacoes: dto.observacoes,
      workflowStatus,
      pendingIssues,
      logradouroId: dto.logradouroId ? asObjectId(dto.logradouroId) : undefined,
      zoneId: dto.zoneId ? asObjectId(dto.zoneId) : undefined,
      faceId: dto.faceId ? asObjectId(dto.faceId) : undefined,
      geometry: dto.geometry,
      areaTerreno: area,
      area,
      createdBy: userId ? asObjectId(userId) : undefined,
    });

    await this.parcelAuditRepository.create({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(projectId),
      parcelId: asObjectId(created.id),
      action: 'CREATE',
      before: {},
      after: {
        sqlu: created.sqlu,
        status: created.status,
        workflowStatus: created.workflowStatus,
        pendingIssues: created.pendingIssues,
      },
      diff: {
        created: { before: null, after: true },
      },
      actorId: userId ? asObjectId(userId) : undefined,
    });

    return created;
  }

  async update(
    tenantId: string,
    projectId: string | undefined,
    id: string,
    dto: UpdateParcelDto,
    userId?: string,
  ) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const existing = await this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
    if (!existing) {
      throw new BadRequestException('Parcela nao encontrada');
    }

    const enderecoPrincipal = dto.enderecoPrincipal;
    const computedMainAddress =
      dto.mainAddress ??
      (enderecoPrincipal
        ? [enderecoPrincipal.logradouro, enderecoPrincipal.numero].filter(Boolean).join(', ')
        : undefined);
    const statusCadastral = parseStatus(dto.statusCadastral ?? dto.status);
    const update: Record<string, unknown> = {
      sqlu: dto.sqlu,
      inscription: dto.inscription ?? dto.inscricaoImobiliaria,
      inscricaoImobiliaria: dto.inscricaoImobiliaria ?? dto.inscription,
      enderecoPrincipal,
      status: dto.status ?? dto.statusCadastral,
      statusCadastral,
      observacoes: dto.observacoes,
      workflowStatus: dto.workflowStatus ? normalizeWorkflowStatus(dto.workflowStatus) : existing.workflowStatus,
      logradouroId: dto.logradouroId ? asObjectId(dto.logradouroId) : undefined,
      zoneId: dto.zoneId ? asObjectId(dto.zoneId) : undefined,
      faceId: dto.faceId ? asObjectId(dto.faceId) : undefined,
    };
    if (computedMainAddress !== undefined) {
      update.mainAddress = computedMainAddress;
    }
    if (dto.geometry) {
      if (!isPolygonGeometry(dto.geometry)) {
        throw new BadRequestException('Geometria invalida para parcela');
      }
      update.geometry = dto.geometry;
      update.areaTerreno = calculateGeometryArea(dto.geometry);
      update.area = calculateGeometryArea(dto.geometry);
    }

    const mergedAfter = {
      mainAddress: (update.mainAddress as string | undefined) ?? existing.mainAddress,
      enderecoPrincipal:
        (update.enderecoPrincipal as { logradouro?: string } | undefined) ?? existing.enderecoPrincipal,
      inscricaoImobiliaria:
        (update.inscricaoImobiliaria as string | undefined) ?? existing.inscricaoImobiliaria,
      inscription: (update.inscription as string | undefined) ?? existing.inscription,
      geometry: update.geometry ?? existing.geometry,
      areaTerreno: (update.areaTerreno as number | undefined) ?? existing.areaTerreno,
      area: (update.area as number | undefined) ?? existing.area,
      status: (update.status as string | undefined) ?? existing.status,
      statusCadastral: (update.statusCadastral as string | undefined) ?? existing.statusCadastral,
    };

    const pendingIssues = this.computePendingIssues(mergedAfter);
    update.pendingIssues = pendingIssues;
    if (!dto.workflowStatus) {
      update.workflowStatus = pendingIssues.length > 0 ? 'PENDENTE' : existing.workflowStatus ?? 'PENDENTE';
    }

    const updated = await this.parcelsRepository.update(
      tenantId,
      String(resolvedProjectId),
      id,
      update,
    );
    if (!updated) {
      throw new BadRequestException('Parcela nao encontrada');
    }

    const beforeSnapshot = {
      sqlu: existing.sqlu,
      inscription: existing.inscription,
      status: existing.status,
      statusCadastral: existing.statusCadastral,
      workflowStatus: existing.workflowStatus,
      pendingIssues: existing.pendingIssues,
      mainAddress: existing.mainAddress,
      areaTerreno: existing.areaTerreno,
      area: existing.area,
    };
    const afterSnapshot = {
      sqlu: updated.sqlu,
      inscription: updated.inscription,
      status: updated.status,
      statusCadastral: updated.statusCadastral,
      workflowStatus: updated.workflowStatus,
      pendingIssues: updated.pendingIssues,
      mainAddress: updated.mainAddress,
      areaTerreno: updated.areaTerreno,
      area: updated.area,
    };
    const diff = this.buildDiff(beforeSnapshot, afterSnapshot);

    await this.parcelAuditRepository.create({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(resolvedProjectId),
      parcelId: asObjectId(updated.id),
      action: 'UPDATE',
      before: beforeSnapshot,
      after: afterSnapshot,
      diff,
      actorId: userId ? asObjectId(userId) : undefined,
    });

    return updated;
  }

  async remove(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    await this.parcelsRepository.delete(tenantId, String(resolvedProjectId), id);
    return { success: true };
  }

  async geojson(
    tenantId: string,
    projectId?: string,
    filters?: {
      sqlu?: string;
      inscription?: string;
      inscricaoImobiliaria?: string;
      status?: string;
      workflowStatus?: string;
      bbox?: string;
      q?: string;
    },
  ): Promise<ParcelGeoJson> {
    const parcels = await this.list(tenantId, projectId, filters);
    return {
      type: 'FeatureCollection',
      features: parcels.map((parcel) => ({
        type: 'Feature',
        id: parcel.id,
        geometry: parcel.geometry,
        properties: {
          parcelId: parcel.id,
          featureType: 'parcel',
          sqlu: parcel.sqlu,
          inscricaoImobiliaria: parcel.inscricaoImobiliaria ?? parcel.inscription,
          inscription: parcel.inscription ?? parcel.inscricaoImobiliaria,
          statusCadastral: parcel.statusCadastral ?? parcel.status,
          status: parcel.status ?? parcel.statusCadastral,
          workflowStatus: parcel.workflowStatus ?? 'PENDENTE',
          pendingIssues: parcel.pendingIssues ?? [],
          address: parcel.mainAddress,
          enderecoPrincipal: parcel.enderecoPrincipal,
          areaTerreno: parcel.areaTerreno ?? parcel.area,
          area: parcel.area,
        },
      })),
    };
  }

  async getSummary(tenantId: string, projectId: string | undefined, id: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const parcel = await this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
    if (!parcel) {
      throw new BadRequestException('Parcela nao encontrada');
    }

    const [building, socioeconomic, infrastructure, logradouro] = await Promise.all([
      this.parcelBuildingsService.findByParcel(tenantId, String(resolvedProjectId), parcel.id),
      this.parcelSocioeconomicService.findByParcel(tenantId, String(resolvedProjectId), parcel.id),
      this.parcelInfrastructureService.findByParcel(tenantId, String(resolvedProjectId), parcel.id),
      parcel.logradouroId
        ? this.logradourosService.findById(
            tenantId,
            String(resolvedProjectId),
            String(parcel.logradouroId),
          )
        : null,
    ]);

    return {
      parcel,
      building,
      socioeconomic,
      infrastructure,
      logradouro,
    };
  }

  async importGeojson(
    tenantId: string,
    projectId: string | undefined,
    featureCollection: ParcelGeoJson,
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
      const sqlu = String(props.sqlu ?? props.SQLU ?? '').trim();
      const inscription = String(
        props.inscricaoImobiliaria ?? props.inscription ?? props.inscricao ?? '',
      ).trim();
      const mainAddress = String(props.address ?? props.endereco ?? '').trim();
      if (!sqlu || !inscription || !mainAddress) {
        errors += 1;
        continue;
      }
      try {
        const area = calculateGeometryArea(geometry);
        const statusCadastral = normalizeStatus(String(props.statusCadastral ?? props.status ?? 'ATIVO'));
        const pendingIssues = this.computePendingIssues({
          mainAddress,
          inscricaoImobiliaria: inscription,
          inscription,
          geometry,
          areaTerreno: area,
          area,
          status: String(props.status ?? props.statusCadastral ?? statusCadastral),
          statusCadastral,
        });
        await this.parcelsRepository.create({
          tenantId: asObjectId(tenantId),
          projectId: resolvedProjectId,
          sqlu,
          inscricaoImobiliaria: inscription,
          inscription,
          mainAddress,
          statusCadastral,
          status: String(props.status ?? props.statusCadastral ?? statusCadastral),
          workflowStatus: pendingIssues.length > 0 ? 'PENDENTE' : 'APROVADA',
          pendingIssues,
          geometry,
          areaTerreno: area,
          area,
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

