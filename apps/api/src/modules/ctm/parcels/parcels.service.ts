import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Types } from 'mongoose';
import { calculateGeometryArea, isPolygonGeometry } from '../../../common/utils/geo';
import * as GeoJSON from 'geojson';
import PDFDocument from 'pdfkit';
import { asObjectId } from '../../../common/utils/object-id';
import { createVectorTile } from '../../../common/utils/mvt.util';
import {
  CRS_WGS84,
  CRS_SIRGAS2000_UTM_23S,
  CRS_SIRGAS2000_UTM_24S,
  convertGeometryCoordinates,
} from '../../../common/utils/crs';
import { ProjectsService } from '../../projects/projects.service';
import { ParcelBuildingsService } from '../parcel-buildings/parcel-buildings.service';
import { ParcelInfrastructureService } from '../parcel-infrastructure/parcel-infrastructure.service';
import { ParcelSocioeconomicService } from '../parcel-socioeconomic/parcel-socioeconomic.service';
import { LogradourosService } from '../logradouros/logradouros.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ParcelAuditRepository } from './parcel-audit.repository';
import { ParcelsRepository } from './parcels.repository';
import { ImportBatchRepository } from './import-batch.repository';

type ParcelGeoJson = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    id?: string;
    geometry: unknown;
    properties: Record<string, unknown>;
  }>;
};

function isParcelGeoJson(value: unknown): value is ParcelGeoJson {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ParcelGeoJson>;
  if (candidate.type !== 'FeatureCollection' || !Array.isArray(candidate.features)) return false;
  return candidate.features.every((feature) => {
    if (!feature || typeof feature !== 'object') return false;
    const item = feature as { type?: unknown; geometry?: unknown; properties?: unknown };
    return item.type === 'Feature' && typeof item.properties === 'object' && item.properties !== null;
  });
}

const STATUS_VALUES = new Set(['ATIVO', 'INATIVO', 'CONFLITO']);
const IPTUSTATUS_VALUES = new Set(['QUITADO', 'PARCELADO', 'INADIMPLENTE', 'ISENTO', 'EXIGIVEL', 'NAO_CADASTRADO']);

const parseStatus = (value?: string): 'ATIVO' | 'INATIVO' | 'CONFLITO' | undefined =>
  value && STATUS_VALUES.has(value) ? (value as 'ATIVO' | 'INATIVO' | 'CONFLITO') : undefined;

const normalizeStatus = (value?: string): 'ATIVO' | 'INATIVO' | 'CONFLITO' =>
  parseStatus(value) ?? 'ATIVO';

const normalizeIptuStatus = (value?: string): string | undefined =>
  value && IPTUSTATUS_VALUES.has(value) ? value : undefined;

const WORKFLOW_VALUES = new Set(['PENDENTE', 'EM_VALIDACAO', 'APROVADA', 'REPROVADA']);

const normalizeWorkflowStatus = (
  value?: string,
): 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA' =>
  (value && WORKFLOW_VALUES.has(value)
    ? value
    : 'PENDENTE') as 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA';

const PROPERTY_ALIASES: Record<string, string[]> = {
  sqlu: ['sqlu', 'sql_u', 'codigo_sql', 'codigosqlu', 'lote_codigo', 'sql', 'sql_code', 'cod_sql', 'codigosql', 'id'],
  inscricaoImobiliaria: ['inscricaoimobiliaria', 'inscricao', 'inscricao_imob', 'inscricao_imobiliaria', 'codigo_inscricao', 'codigoimovel', 'cadastro', 'cod_cad', 'codcadastro', 'inscricao_imobiliaria'],
  codigoImovel: ['codigoimovel', 'codigo_imovel', 'cod_imov', 'codigo', 'codigo_sql'],
  setor: ['setor', 'cd_setor', 'setor_codigo', 'setor_cod', 'num_setor'],
  quadra: ['quadra', 'cd_quadra', 'quadra_codigo', 'quadras', 'quadra_cod', 'num_quadra'],
  lote: ['lote', 'cd_lote', 'lote_codigo', 'numero_lote', 'lote_cod', 'num_lote'],
  endereco: ['endereco', 'logradouro', 'rua', 'nome_logradouro', 'nome', 'mainaddress', 'nome_logr', 'logradouro_nome'],
  numero: ['numero', 'num', 'numero_endereco', 'nr', 'num_end'],
  complemento: ['complemento', 'comp', 'complemento_endereco'],
  bairro: ['bairro', 'bairro_nome', 'nome_bairro', 'distrito', 'bairro_cod'],
  cep: ['cep', 'cep_endereco', 'codigo_cep'],
  zoneamento: ['zoneamento', 'zona', 'zona_uso', 'zone', 'zona_zoneamento', 'uso', 'categoria', 'tipo'],
  areaTerreno: ['areaterreno', 'area_terreno', 'area_terr', 'area_m2', 'area', 'area_parcela', 'area_lote'],
  areaConstruida: ['areaconstruida', 'area_construida', 'area_const', 'area_edificada', 'area_edif'],
  areaCartografica: ['areacartografica', 'area_carto', 'area_cartografica'],
  valorVenalTerreno: ['valorvenalterreno', 'vv_terreno', 'valor_terreno', 'valor_venal_terreno'],
  valorVenalConstrucao: ['valorvenalkonstrucao', 'vv_construcao', 'valor_construcao', 'valor_venal_construcao'],
  valorVenalTotal: ['valorvenaltotal', 'vv_total', 'valor_total', 'valor_venal_total', 'valor_venal'],
  iptuLancado: ['iptulantado', 'iptu_lancado', 'valor_iptu', 'lancamento_iptu'],
  iptuPago: ['iptupago', 'iptu_pago', 'valor_pago', 'pago_iptu'],
  iptuEmAberto: ['iptuemaberto', 'iptu_aberto', 'saldo', 'valor_aberto'],
  statusIPTU: ['statusiptu', 'status_iptu', 'situacao_iptu', 'situacao'],
  exercicioIPTU: ['exercicioiptu', 'exercicio_iptu', 'ano', 'ano_exercicio', 'exercicio'],
  proprietarioNome: ['proprietario', 'proprietario_nome', 'nome_proprietario', 'dono', 'nome_dono'],
  proprietarioDocumento: ['cpf', 'cnpj', 'documento', 'cpf_cnpj', 'documento_proprietario'],
};

function getPropertyValue(props: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = props[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return undefined;
}

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[R$\s]/g, '').replace(',', '.'));
  return isNaN(num) ? undefined : num;
}

function calculateCentroid(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): { type: string; coordinates: [number, number] } {
  if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
    return { type: 'Point', coordinates: [0, 0] };
  }

  let allCoords: [number, number][] = [];
  if (geometry.type === 'Polygon') {
    allCoords = geometry.coordinates[0] as [number, number][];
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      if (polygon[0]) {
        allCoords.push(...(polygon[0] as [number, number][]));
      }
    }
  }

  if (allCoords.length > 0) {
    let sumX = 0, sumY = 0;
    for (const coord of allCoords) {
      sumX += coord[0];
      sumY += coord[1];
    }
    return { type: 'Point', coordinates: [sumX / allCoords.length, sumY / allCoords.length] };
  }
  
  return { type: 'Point', coordinates: [0, 0] };
}

function calculateBbox(geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  const polygons = geometry.type === 'Polygon' 
    ? [geometry.coordinates] 
    : geometry.coordinates as number[][][][];

  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const coord of ring as unknown as [number, number][]) {
        if (coord[0] < minX) minX = coord[0];
        if (coord[0] > maxX) maxX = coord[0];
        if (coord[1] < minY) minY = coord[1];
        if (coord[1] > maxY) maxY = coord[1];
      }
    }
  }

  if (minX === Infinity) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  
  return { minX, minY, maxX, maxY };
}

@Injectable()
export class ParcelsService {
  private readonly logger = new Logger(ParcelsService.name);

  constructor(
    private readonly parcelsRepository: ParcelsRepository,
    private readonly projectsService: ProjectsService,
    private readonly parcelBuildingsService: ParcelBuildingsService,
    private readonly parcelSocioeconomicService: ParcelSocioeconomicService,
    private readonly parcelInfrastructureService: ParcelInfrastructureService,
    private readonly logradourosService: LogradourosService,
    private readonly parcelAuditRepository: ParcelAuditRepository,
    private readonly importBatchRepository: ImportBatchRepository,
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
    sourceType?: string;
    sqlu?: string;
  }) {
    const issues: string[] = [];
    const hasAddress = Boolean(parcel.mainAddress || parcel.enderecoPrincipal?.logradouro);
    const hasInscription = Boolean(parcel.inscricaoImobiliaria || parcel.inscription);
    const hasGeometry = Boolean(parcel.geometry);
    const hasArea = (parcel.areaTerreno ?? parcel.area ?? 0) > 0;
    const hasStatus = Boolean(parcel.status || parcel.statusCadastral);
    const isDemo = parcel.sourceType === 'DEMO' || parcel.sourceType === 'DEMO_EXTERNAL' || parcel.sourceType === 'OFFICIAL_SAMPLE';
    if (!hasAddress && !isDemo) issues.push('SEM_ENDERECO');
    if (!hasInscription && !isDemo) issues.push('SEM_INSCRICAO');
    if (!hasGeometry && !isDemo) issues.push('SEM_GEOMETRIA');
    if (!hasArea && !isDemo) issues.push('SEM_AREA');
    if (!hasStatus) issues.push('SEM_STATUS');
    if (!parcel.sqlu) issues.push('SEM_SQLU');
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
      sourceType?: string;
      isOfficial?: boolean;
      zoneamento?: string;
      statusIPTU?: string;
    },
  ) {
    if (filters?.bbox) {
      const parts = filters.bbox.split(',');
      if (parts.length !== 4) {
        throw new BadRequestException('Bbox deve conter exatamente 4 coordenadas (minLng,minLat,maxLng,maxLat)');
      }
      const [minLng, minLat, maxLng, maxLat] = parts.map(Number);
      if ([minLng, minLat, maxLng, maxLat].some(isNaN)) {
        throw new BadRequestException('Coordenadas do bbox devem ser numeros validos');
      }
      if (minLng > maxLng || minLat > maxLat) {
        throw new BadRequestException('Coordenadas do bbox estao invertidas: minLng nao pode ser maior que maxLng, e minLat nao pode ser maior que maxLat');
      }
    }
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
      sourceType: filters?.sourceType,
      isOfficial: filters?.isOfficial,
      zoneamento: filters?.zoneamento,
      statusIPTU: filters?.statusIPTU,
    });
  }

  async getStatistics(tenantId: string, projectId?: string) {
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const parcels = await this.parcelsRepository.list(tenantId, { projectId: String(resolvedProjectId) });
    
    const total = parcels.length;
    const official = parcels.filter(p => p.isOfficial === true).length;
    const demo = parcels.filter(p => p.sourceType === 'DEMO').length;
    const withSqlu = parcels.filter(p => p.sqlu).length;
    const withIptu = parcels.filter(p => p.statusIPTU && p.statusIPTU !== 'NAO_CADASTRADO').length;
    const totalValorVenal = parcels.reduce((sum, p) => sum + (p.valorVenalTotal || 0), 0);
    const totalIptuLancado = parcels.reduce((sum, p) => sum + (Number(p.iptuLancado) || 0), 0);
    const totalIptuPago = parcels.reduce((sum, p) => sum + (Number(p.iptuPago) || 0), 0);
    const totalIptuEmAberto = parcels.reduce((sum, p) => sum + (Number(p.iptuEmAberto) || 0), 0);
    const inadimplentes = parcels.filter(p => p.statusIPTU === 'INADIMPLENTE').length;
    const taxaAdimplencia = withIptu > 0 ? ((withIptu - inadimplentes) / withIptu) * 100 : 0;

    const byZone = parcels.reduce((acc, p) => {
      const zone = p.zoneamento || 'NÃO DEFINIDO';
      acc[zone] = (acc[zone] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = parcels.reduce((acc, p) => {
      const status = p.statusIPTU || 'SEM IPTU';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      official,
      demo,
      withSqlu,
      withIptu,
      totalValorVenal,
      totalIptuLancado,
      totalIptuPago,
      totalIptuEmAberto,
      inadimplentes,
      taxaAdimplencia: Math.round(taxaAdimplencia * 100) / 100,
      byZone,
      byStatus,
    };
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
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de parcela invalido');
    }
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    return this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
  }

  async getHistory(tenantId: string, projectId: string | undefined, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de parcela invalido');
    }
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
      sqlu: dto.sqlu,
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
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de parcela invalido');
    }
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

    const pendingIssues = this.computePendingIssues({
      ...mergedAfter,
      sqlu: (update.sqlu as string | undefined) ?? existing.sqlu,
      sourceType: existing.sourceType,
    });
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
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de parcela invalido');
    }
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
      sourceType?: string;
      isOfficial?: boolean;
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
          sourceType: parcel.sourceType,
          isOfficial: parcel.isOfficial,
          zoneamento: parcel.zoneamento,
          statusIPTU: parcel.statusIPTU,
          iptuLancado: parcel.iptuLancado,
          iptuPago: parcel.iptuPago,
          iptuEmAberto: parcel.iptuEmAberto,
        },
      })),
    };
  }

  async vectorTiles(
    tenantId: string,
    projectId: string | undefined,
    z: number,
    x: number,
    y: number,
  ): Promise<Buffer> {
    const geojsonData = await this.geojson(tenantId, projectId);
    return createVectorTile(geojsonData, z, x, y);
  }

  async getSummary(tenantId: string, projectId: string | undefined, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de parcela invalido');
    }
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

  /**
   * Detect and convert CRS for geometry coordinates.
   * Handles UTM Zone 23S/24S (SIRGAS2000) to WGS84 conversion automatically.
   */
  private detectAndConvertCRS(
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon,
    municipalityName?: string,
  ): { geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon; transformed: boolean; crsWarnings: string[] } {
    const crsWarnings: string[] = [];

    // Extract first coordinate for detection
    // geometry is already validated as Polygon or MultiPolygon by the caller
    const firstPolygon = geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates[0];
    const firstRing = firstPolygon?.[0];
    const firstCoord = firstRing?.[0];

    if (!firstCoord || !Array.isArray(firstCoord) || firstCoord.length < 2) {
      return { geometry, transformed: false, crsWarnings };
    }

    const [x, y] = firstCoord;
    if (typeof x !== 'number' || typeof y !== 'number') {
      return { geometry, transformed: false, crsWarnings };
    }

    // Check if coordinates look like WGS84
    const looksLikeWgs84 = Math.abs(x) <= 180 && Math.abs(y) <= 90;
    
    if (looksLikeWgs84) {
      // Already in WGS84 range, validate bounds
      if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
        return { geometry, transformed: false, crsWarnings };
      }
    }

    // Coordinates outside WGS84 bounds - likely UTM
    // Try to detect which UTM zone based on coordinate ranges or municipality
    let detectedCrs: string | null = null;
    let zone = 23; // Default for São Paulo

    // Detect from coordinate ranges
    if (x >= 100000 && x <= 900000 && y >= 7000000 && y <= 11000000) {
      // UTM coordinates in Brazil range
      // Zone 23S: central meridian -45°, covers roughly -51° to -45°
      // Zone 24S: central meridian -51°, covers roughly -45° to -39°
      // For São Paulo area, can be either depending on exact location
      zone = x < 500000 ? 23 : 24;
      detectedCrs = zone === 23 ? CRS_SIRGAS2000_UTM_23S : CRS_SIRGAS2000_UTM_24S;
    }

    // Override zone detection based on municipality
    if (municipalityName) {
      const normalized = municipalityName.toLowerCase();
      // Most of São Paulo state is in zone 23
      if (normalized.includes('sao paulo') || normalized.includes('sp') || normalized.includes('paulo')) {
        zone = 23;
        detectedCrs = CRS_SIRGAS2000_UTM_23S;
      }
    }

    // If we detected UTM, try to convert
    if (detectedCrs) {
      const targetCrs = CRS_WGS84;
      const converted = convertGeometryCoordinates(geometry, detectedCrs, targetCrs);

      if (converted && (converted.type === 'Polygon' || converted.type === 'MultiPolygon')) {
        crsWarnings.push(`Converted from ${detectedCrs} (Zone ${zone}S) to ${targetCrs} for ${municipalityName || 'unknown municipality'}`);
        return { geometry: converted, transformed: true, crsWarnings };
      }
    }

    // If detection failed but coordinates are out of WGS84 bounds, try zone 23 as fallback
    if (!looksLikeWgs84 && !detectedCrs) {
      const fallbackCrs = CRS_SIRGAS2000_UTM_23S;
      const converted = convertGeometryCoordinates(geometry, fallbackCrs, CRS_WGS84);
      if (converted && (converted.type === 'Polygon' || converted.type === 'MultiPolygon')) {
        crsWarnings.push(`Fallback conversion from ${fallbackCrs} to WGS84 (coordinates out of bounds)`);
        return { geometry: converted, transformed: true, crsWarnings };
      }
    }

    // Could not convert, return original
    return { geometry, transformed: false, crsWarnings };
  }

  async importGeojson(
    tenantId: string,
    projectId: string | undefined,
    featureCollection: ParcelGeoJson,
    sourceType: string = 'GEOJSON',
    fileName?: string,
    upsert: boolean = false,
    userId?: string,
    municipalityName?: string,
    municipalityCode?: string,
  ) {
    if (!isParcelGeoJson(featureCollection)) {
      throw new BadRequestException('GeoJSON de parcelas invalido');
    }
    if (!featureCollection?.features?.length) {
      return { batchId: null, inserted: 0, updated: 0, skipped: 0, errors: 0, errorDetails: [] };
    }
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const batch = await this.importBatchRepository.create({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProjectId,
      sourceType,
      fileName,
      status: 'PROCESSING',
      totalRecords: featureCollection.features.length,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
    });
    const batchId = batch.id;

    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: Array<{ row: number; featureId?: string; message: string; field?: string }> = [];

    const isOfficial = sourceType === 'OFFICIAL_IMPORT' || sourceType === 'SHAPEFILE';
    const isExternalDemo = sourceType === 'DEMO_EXTERNAL' || sourceType === 'OFFICIAL_SAMPLE';

    for (let i = 0; i < featureCollection.features.length; i++) {
      const feature = featureCollection.features[i];
      const featureId = feature.id;
      const props = feature.properties ?? {};

      try {
        const sqlu = getPropertyValue(props, ...(PROPERTY_ALIASES.sqlu || []));
        const inscription = getPropertyValue(props, ...(PROPERTY_ALIASES.inscricaoImobiliaria || []));
        
        if (!sqlu && !inscription) {
          errors++;
          errorDetails.push({ row: i + 1, featureId: String(featureId), message: 'SQLU ou inscrição obrigatória', field: 'sqlu/inscricao' });
          continue;
        }

        const existingBySqlu = sqlu ? await this.parcelsRepository.findBySqlu(tenantId, String(resolvedProjectId), sqlu) : null;
        const existingByInscription = inscription ? await this.parcelsRepository.findByInscription(tenantId, String(resolvedProjectId), inscription) : null;
        const existing = existingBySqlu || existingByInscription;

        if (existing && !upsert) {
          skipped++;
          errorDetails.push({ row: i + 1, featureId: String(featureId), message: 'Parcela já existe (use upsert para atualizar)', field: 'sqlu' });
          continue;
        }

        const geometry = feature.geometry;
        if (!isPolygonGeometry(geometry)) {
          errors++;
          errorDetails.push({ row: i + 1, featureId: String(featureId), message: 'Geometria inválida ou ausente', field: 'geometry' });
          continue;
        }

        let geo: GeoJSON.Polygon | GeoJSON.MultiPolygon = geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
        
        // CRS Detection and Auto-Conversion
        // If coordinates are outside WGS84 bounds, attempt to detect and convert from UTM
        const crsResult = this.detectAndConvertCRS(geo, municipalityName);
        if (crsResult.transformed) {
          geo = crsResult.geometry;
          // Track CRS conversion in batch warnings
          await this.importBatchRepository.addWarning(
            batchId,
            `_row=${i + 1}_FEAT=${featureId}: ${crsResult.crsWarnings.join('; ')}`
          );
        }

        // Validate converted coordinates are within WGS84 bounds
        const firstPolygon = geo.type === 'Polygon' ? geo.coordinates : geo.coordinates[0];
        const firstCoord = firstPolygon?.[0]?.[0];
        if (firstCoord && Array.isArray(firstCoord) && firstCoord.length >= 2) {
          const lng = firstCoord[0];
          const lat = firstCoord[1];
          if (typeof lng === 'number' && typeof lat === 'number' && (Math.abs(lng) > 180 || Math.abs(lat) > 90)) {
            errors++;
            errorDetails.push({ row: i + 1, featureId: String(featureId), message: `Coordenadas inválidas após conversão CRS (Lng: ${lng}, Lat: ${lat}).`, field: 'geometry' });
            continue;
          }
        }

        const areaCartografica = calculateGeometryArea(geo);
        const centroid = calculateCentroid(geo);
        const bbox = calculateBbox(geo);

        const endereco = getPropertyValue(props, ...(PROPERTY_ALIASES.endereco || []));
        const numero = getPropertyValue(props, ...(PROPERTY_ALIASES.numero || []));
        const complemento = getPropertyValue(props, ...(PROPERTY_ALIASES.complemento || []));
        const bairro = getPropertyValue(props, ...(PROPERTY_ALIASES.bairro || []));
        const cep = getPropertyValue(props, ...(PROPERTY_ALIASES.cep || []));
        const zoneamento = getPropertyValue(props, ...(PROPERTY_ALIASES.zoneamento || []));

        const defaultCidade = municipalityName || (isExternalDemo ? 'São Paulo' : 'Ubatuba');
        const defaultUf = 'SP';

        const enderecoPrincipal = {
          logradouro: endereco,
          numero,
          complemento,
          bairro,
          cep,
          cidade: defaultCidade,
          uf: defaultUf,
        };

        const mainAddress = endereco ? `${endereco}${numero ? ', ' + numero : ''}${bairro ? ' - ' + bairro : ''}` : undefined;

        const areaTerreno = parseNumber(getPropertyValue(props, ...(PROPERTY_ALIASES.areaTerreno || []))) || areaCartografica;
        const areaConstruida = parseNumber(getPropertyValue(props, ...(PROPERTY_ALIASES.areaConstruida || [])));
        const valorVenalTerreno = parseNumber(getPropertyValue(props, ...(PROPERTY_ALIASES.valorVenalTerreno || [])));
        const valorVenalConstrucao = parseNumber(getPropertyValue(props, ...(PROPERTY_ALIASES.valorVenalConstrucao || [])));
        const valorVenalTotal = parseNumber(getPropertyValue(props, ...(PROPERTY_ALIASES.valorVenalTotal || [])));

        const statusCadastral = normalizeStatus(String(props.statusCadastral ?? props.status ?? 'ATIVO'));
        const validationStatus = areaTerreno > 0 && (sqlu || inscription) ? 'VALID' : 'WARNING';
        const validationErrors: string[] = [];
        if (!sqlu) validationErrors.push('SQLU ausente');
        if (!inscription) validationErrors.push('Inscrição ausente');
        if (areaTerreno <= 0) validationErrors.push('Área menor ou igual a zero');

        const pendingIssues = this.computePendingIssues({
          mainAddress,
          enderecoPrincipal,
          inscricaoImobiliaria: inscription,
          inscription,
          geometry,
          areaTerreno,
          area: areaTerreno,
          status: String(props.status ?? statusCadastral),
          statusCadastral,
          sourceType,
          sqlu,
        });

        const parcelData: Record<string, unknown> = {
          tenantId: asObjectId(tenantId),
          projectId: resolvedProjectId,
          sqlu: sqlu || `DEMO-${Date.now()}-${i}`,
          inscricaoImobiliaria: inscription,
          inscription,
          rawProperties: props,
      enderecoPrincipal,
          mainAddress,
          codigoImovel: getPropertyValue(props, ...(PROPERTY_ALIASES.codigoImovel || [])),
          setor: getPropertyValue(props, ...(PROPERTY_ALIASES.setor || [])),
          quadra: getPropertyValue(props, ...(PROPERTY_ALIASES.quadra || [])),
          lote: getPropertyValue(props, ...(PROPERTY_ALIASES.lote || [])),
          zoneamento,
          areaTerreno,
          area: areaTerreno,
          areaConstruida,
          areaCartografica,
          valorVenalTerreno,
          valorVenalConstrucao,
          valorVenalTotal,
          statusCadastral,
          status: String(props.status ?? statusCadastral),
          workflowStatus: pendingIssues.length > 0 ? 'PENDENTE' : 'APROVADA',
          pendingIssues,
          geometry: geo,
          centroid,
          bbox,
          sourceType: sourceType as any,
          importBatchId: batchId,
          isOfficial,
          validationStatus,
          validationErrors,
          createdBy: userId ? asObjectId(userId) : undefined,
        };

        if (isExternalDemo) {
          parcelData.municipalityName = municipalityName || 'São Paulo';
          parcelData.municipalityCode = municipalityCode;
          parcelData.isOfficial = false;
        }

        if (existing && upsert) {
          await this.parcelsRepository.update(tenantId, String(resolvedProjectId), existing.id, parcelData as any);
          inserted++;
        } else {
          await this.parcelsRepository.create(parcelData as any);
          inserted++;
        }
      } catch (err: any) {
        errors++;
        errorDetails.push({ row: i + 1, featureId: String(featureId), message: err?.message || 'Erro ao processar', field: 'general' });
        this.logger.error(`Error importing feature ${i + 1}: ${err?.message}`);
      }
    }

    await this.importBatchRepository.update(batchId, {
      status: errors > 0 ? (inserted > 0 ? 'PARTIAL' : 'FAILED') : 'COMPLETED',
      successCount: inserted,
      errorCount: errors,
      errors: errorDetails,
      completedAt: new Date(),
    });

    return { batchId, inserted, updated: upsert ? inserted : 0, skipped, errors, errorDetails };
  }

  async transicao(
    tenantId: string,
    projectId: string | undefined,
    id: string,
    newStatus: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA',
    observacao: string,
    userId?: string,
    userRole?: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de parcela invalido');
    }
    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const parcel = await this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
    if (!parcel) throw new BadRequestException('Parcela nao encontrada');

    const current = parcel.workflowStatus ?? 'PENDENTE';
    const adminOrGestor = userRole === 'ADMIN' || userRole === 'GESTOR';

    const allowedTransitions: Record<string, string[]> = {
      PENDENTE: ['EM_VALIDACAO'],
      EM_VALIDACAO: ['APROVADA', 'REPROVADA', 'PENDENTE'],
      APROVADA: ['PENDENTE'],
      REPROVADA: ['PENDENTE', 'EM_VALIDACAO'],
    };
    const allowed = allowedTransitions[current] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Transicao invalida: ${current} -> ${newStatus}`);
    }
    if ((newStatus === 'APROVADA' || newStatus === 'REPROVADA') && !adminOrGestor) {
      throw new BadRequestException('Apenas GESTOR ou ADMIN podem aprovar ou reprovar');
    }

    const before = { workflowStatus: current };
    const updated = await this.parcelsRepository.update(tenantId, String(resolvedProjectId), id, {
      workflowStatus: newStatus,
    });
    if (!updated) throw new BadRequestException('Parcela nao encontrada');

    await this.parcelAuditRepository.create({
      tenantId: asObjectId(tenantId),
      projectId: asObjectId(resolvedProjectId),
      parcelId: asObjectId(id),
      action: 'TRANSICAO',
      before,
      after: { workflowStatus: newStatus, observacao },
      diff: { workflowStatus: { before: current, after: newStatus } },
      actorId: userId ? asObjectId(userId) : undefined,
    });

    return updated;
  }

  async importFromCsvEnrichment(
    tenantId: string,
    projectId: string | undefined,
    csvContent: string,
    sourceType: string = 'CSV_ENRICHMENT',
    fileName?: string,
    columnMapping?: Record<string, string>,
    _userId?: string,
  ): Promise<{ batchId: string | null; processed: number; updated: number; notFound: number; errors: number; errorDetails: Array<{ row: number; message: string }> }> {
    const lines = csvContent.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { batchId: null, processed: 0, updated: 0, notFound: 0, errors: 0, errorDetails: [{ row: 0, message: 'CSV sem dados' }] };
    }

    const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
    const batch = await this.importBatchRepository.create({
      tenantId: asObjectId(tenantId),
      projectId: resolvedProjectId,
      sourceType,
      fileName,
      status: 'PROCESSING',
      totalRecords: lines.length - 1,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      errors: [],
      warnings: [],
    });
    const batchId = batch.id;

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));
    const getIdx = (mapping: string) => {
      const mappedCol = columnMapping?.[mapping]?.toLowerCase();
      if (mappedCol) {
        const idx = header.indexOf(mappedCol);
        if (idx >= 0) return idx;
      }
      const aliases = PROPERTY_ALIASES[mapping] || [mapping];
      for (const alias of aliases) {
        const idx = header.indexOf(alias.toLowerCase());
        if (idx >= 0) return idx;
      }
      return -1;
    };

    let processed = 0;
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    const errorDetails: Array<{ row: number; message: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/"/g, ''));
      const sqlu = getIdx('sqlu') >= 0 ? cols[getIdx('sqlu')] : '';
      const inscricao = getIdx('inscricaoImobiliaria') >= 0 ? cols[getIdx('inscricaoImobiliaria')] : '';

      if (!sqlu && !inscricao) {
        errors++;
        errorDetails.push({ row: i + 1, message: 'SQLU ou inscrição obrigatória para vinculação' });
        continue;
      }

      let existing = null;
      if (sqlu) {
        existing = await this.parcelsRepository.findBySqlu(tenantId, String(resolvedProjectId), sqlu);
      }
      if (!existing && inscricao) {
        existing = await this.parcelsRepository.findByInscription(tenantId, String(resolvedProjectId), inscricao);
      }

      if (!existing) {
        notFound++;
        errorDetails.push({ row: i + 1, message: `Parcela não encontrada: SQLU=${sqlu}, Inscrição=${inscricao}` });
        continue;
      }

      processed++;

      try {
        const updateData: Record<string, unknown> = {
          sourceType: 'CSV_ENRICHMENT',
          importBatchId: batchId,
          isOfficial: true,
          updatedAt: new Date(),
        };

        if (getIdx('endereco') >= 0) {
          const endereco = cols[getIdx('endereco')];
          if (endereco) {
            updateData.mainAddress = endereco;
            updateData.enderecoPrincipal = {
              ...(existing.enderecoPrincipal || {}),
              logradouro: endereco,
            };
          }
        }
        if (getIdx('bairro') >= 0) {
          const bairro = cols[getIdx('bairro')];
          if (bairro) {
            updateData.enderecoPrincipal = {
              ...(updateData.enderecoPrincipal as object || existing.enderecoPrincipal || {}),
              bairro,
            };
          }
        }
        if (getIdx('zoneamento') >= 0) {
          const zoneamento = cols[getIdx('zoneamento')];
          if (zoneamento) updateData.zoneamento = zoneamento;
        }
        if (getIdx('areaTerreno') >= 0) {
          const areaTerreno = parseNumber(cols[getIdx('areaTerreno')]);
          if (areaTerreno) {
            updateData.areaTerreno = areaTerreno;
            updateData.area = areaTerreno;
          }
        }
        if (getIdx('areaConstruida') >= 0) {
          const areaConstruida = parseNumber(cols[getIdx('areaConstruida')]);
          if (areaConstruida) updateData.areaConstruida = areaConstruida;
        }
        if (getIdx('valorVenalTerreno') >= 0) {
          const vvt = parseNumber(cols[getIdx('valorVenalTerreno')]);
          if (vvt !== undefined) updateData.valorVenalTerreno = vvt;
        }
        if (getIdx('valorVenalConstrucao') >= 0) {
          const vvc = parseNumber(cols[getIdx('valorVenalConstrucao')]);
          if (vvc !== undefined) updateData.valorVenalConstrucao = vvc;
        }
        if (getIdx('valorVenalTotal') >= 0) {
          const vvt = parseNumber(cols[getIdx('valorVenalTotal')]);
          if (vvt !== undefined) updateData.valorVenalTotal = vvt;
        }
        if (getIdx('iptuLancado') >= 0) {
          const iptuLancado = parseNumber(cols[getIdx('iptuLancado')]);
          if (iptuLancado !== undefined) updateData.iptuLancado = iptuLancado;
        }
        if (getIdx('iptuPago') >= 0) {
          const iptuPago = parseNumber(cols[getIdx('iptuPago')]);
          if (iptuPago !== undefined) updateData.iptuPago = iptuPago;
        }
        if (getIdx('iptuEmAberto') >= 0) {
          const iptuEmAberto = parseNumber(cols[getIdx('iptuEmAberto')]);
          if (iptuEmAberto !== undefined) updateData.iptuEmAberto = iptuEmAberto;
        }
        if (getIdx('statusIPTU') >= 0) {
          const statusIPTU = normalizeIptuStatus(cols[getIdx('statusIPTU')]);
          if (statusIPTU) updateData.statusIPTU = statusIPTU;
        }
        if (getIdx('exercicioIPTU') >= 0) {
          const exercicio = parseInt(cols[getIdx('exercicioIPTU')]);
          if (!isNaN(exercicio)) updateData.exercicioIPTU = exercicio;
        }

        updateData.validationStatus = 'VALID';
        updateData.validationErrors = [];

        await this.parcelsRepository.update(tenantId, String(resolvedProjectId), existing.id, updateData);
        updated++;
      } catch (err: any) {
        errors++;
        errorDetails.push({ row: i + 1, message: err?.message || 'Erro ao atualizar parcela' });
      }
    }

    await this.importBatchRepository.update(batchId, {
      status: errors > 0 || notFound > 0 ? (updated > 0 ? 'PARTIAL' : 'FAILED') : 'COMPLETED',
      successCount: updated,
      errorCount: errors + notFound,
      errors: errorDetails,
      completedAt: new Date(),
    });

    return { batchId, processed, updated, notFound, errors, errorDetails };
  }

  async generatePdf(tenantId: string, parcelId: string): Promise<Buffer> {
    const parcel = await this.findById(tenantId, undefined, parcelId);
    if (!parcel) throw new NotFoundException('Lote não encontrado');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const address = parcel.mainAddress || [
        (parcel.enderecoPrincipal as any)?.logradouro,
        (parcel.enderecoPrincipal as any)?.numero,
        (parcel.enderecoPrincipal as any)?.bairro,
      ].filter(Boolean).join(', ') || 'Não informado';

      // Header
      doc.fontSize(9).fillColor('#666').text('PREFEITURA MUNICIPAL', { align: 'center' });
      doc.fontSize(14).fillColor('#000').font('Helvetica-Bold')
        .text('FICHA DE IMÓVEL — CADASTRO TÉCNICO MUNICIPAL', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).font('Helvetica').fillColor('#666')
        .text(`Emitido em: ${new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, { align: 'right' });

      // Separator
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
      doc.moveDown(0.5);

      // Section: Identificação
      doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text('IDENTIFICAÇÃO DO IMÓVEL');
      doc.moveDown(0.3);
      const fields = [
        ['SQLU', parcel.sqlu || '—'],
        ['Inscrição Imobiliária', (parcel as any).inscricaoImobiliaria || '—'],
        ['Endereço', address],
        ['Bairro', (parcel.enderecoPrincipal as any)?.bairro || '—'],
        ['Área Terreno', parcel.areaTerreno ? `${Number(parcel.areaTerreno).toFixed(2)} m²` : '—'],
        ['Área Construída', (parcel as any).areaConstruida ? `${Number((parcel as any).areaConstruida).toFixed(2)} m²` : '—'],
        ['Status Cadastral', (parcel as any).statusCadastral || '—'],
        ['Status Workflow', (parcel as any).workflowStatus || '—'],
        ['Origem do Dado', (parcel as any).sourceType || '—'],
        ['Zoneamento', (parcel as any).zoneamento || '—'],
      ];
      doc.fontSize(10).font('Helvetica');
      fields.forEach(([label, value]) => {
        doc.fillColor('#666').text(`${label}: `, { continued: true })
          .fillColor('#000').text(value);
      });

      // Section: Tributação
      const hasIptu = (parcel as any).statusIPTU && (parcel as any).statusIPTU !== 'NAO_CADASTRADO';
      if (hasIptu) {
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
        doc.moveDown(0.3);
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text('TRIBUTAÇÃO');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
        const fmt = (v: number) => v ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';
        [
          ['Status IPTU', (parcel as any).statusIPTU || '—'],
          ['Valor Venal', fmt((parcel as any).valorVenalTotal)],
          ['IPTU Lançado', fmt((parcel as any).iptuLancado)],
          ['IPTU Pago', fmt((parcel as any).iptuPago)],
          ['IPTU Em Aberto', fmt((parcel as any).iptuEmAberto)],
        ].forEach(([label, value]) => {
          doc.fillColor('#666').text(`${label}: `, { continued: true })
            .fillColor('#000').text(value);
        });
      }

      // Footer
      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
      doc.moveDown(0.3);
      doc.fontSize(8).fillColor('#999')
        .text('Este documento é gerado automaticamente pelo sistema FlyDea — Cadastro Técnico Municipal. Não substitui certidão oficial.', { align: 'center' });

      doc.end();
    });
  }

  async getAuditLog(
    tenantId: string,
    filters: { parcelId?: string; actorId?: string; action?: string; limit?: number; offset?: number },
  ) {
    const entries = await this.parcelAuditRepository.listAll(tenantId, filters);
    const total = await this.parcelAuditRepository.countAll(tenantId, filters);
    return { entries, total, limit: filters.limit ?? 50, offset: filters.offset ?? 0 };
  }

  async bulkTransicao(
    tenantId: string,
    ids: string[],
    newStatus: 'PENDENTE' | 'EM_VALIDACAO' | 'APROVADA' | 'REPROVADA',
    observacao: string,
    userId?: string,
    userRole?: string,
  ) {
    const results = await Promise.allSettled(
      ids.map((id) =>
        this.transicao(tenantId, undefined, id, newStatus, observacao, userId, userRole),
      ),
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      total: ids.length,
      successful,
      failed,
      results: results.map((r, i) => ({
        id: ids[i],
        status: r.status === 'fulfilled' ? 'ok' : 'erro',
        message: r.status === 'rejected' ? (r.reason as Error).message : undefined,
      })),
    };
  }

  async syncFromSftpInbox(
    tenantId: string,
    projectId?: string,
    userId?: string,
  ) {
    const inboxPath = path.join(process.cwd(), 'sftp_inbox');
    const processedPath = path.join(inboxPath, 'processed');

    if (!fs.existsSync(inboxPath)) {
      fs.mkdirSync(inboxPath, { recursive: true });
    }
    if (!fs.existsSync(processedPath)) {
      fs.mkdirSync(processedPath, { recursive: true });
    }

    const files = fs.readdirSync(inboxPath)
      .filter((file) => file.endsWith('.csv'))
      .map((file) => path.join(inboxPath, file));

    if (files.length === 0) {
      return {
        message: 'Nenhum arquivo de enriquecimento tributário (.csv) encontrado no SFTP',
        processedFiles: 0,
        results: [],
      };
    }

    const results = [];
    for (const filePath of files) {
      const fileName = path.basename(filePath);
      try {
        const csvContent = fs.readFileSync(filePath, 'utf8');
        const importResult = await this.importFromCsvEnrichment(
          tenantId,
          projectId,
          csvContent,
          'SFTP_IMPORT',
          fileName,
          undefined,
          userId,
        );

        // Mover para processados com timestamp
        const ext = path.extname(fileName);
        const nameWithoutExt = path.basename(fileName, ext);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const destination = path.join(processedPath, `${nameWithoutExt}_${timestamp}${ext}`);
        
        fs.renameSync(filePath, destination);

        results.push({
          fileName,
          status: 'success',
          details: importResult,
        });
      } catch (err: any) {
        results.push({
          fileName,
          status: 'error',
          message: err?.message || 'Erro desconhecido',
        });
      }
    }

    return {
      message: `${results.filter(r => r.status === 'success').length} de ${files.length} arquivos processados com sucesso via SFTP`,
      processedFiles: files.length,
      results,
    };
  }

  async getSftpInboxStatus() {
    const inboxPath = path.join(process.cwd(), 'sftp_inbox');
    const processedPath = path.join(inboxPath, 'processed');

    if (!fs.existsSync(inboxPath)) {
      fs.mkdirSync(inboxPath, { recursive: true });
    }
    if (!fs.existsSync(processedPath)) {
      fs.mkdirSync(processedPath, { recursive: true });
    }

    const pendingFiles = fs.readdirSync(inboxPath)
      .filter((file) => file.endsWith('.csv'))
      .map((file) => {
        const filePath = path.join(inboxPath, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          sizeBytes: stats.size,
          createdAt: stats.birthtime,
        };
      });

    const processedFiles = fs.readdirSync(processedPath)
      .filter((file) => file.endsWith('.csv'))
      .map((file) => {
        const filePath = path.join(processedPath, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          sizeBytes: stats.size,
          processedAt: stats.mtime,
        };
      })
      .sort((a, b) => b.processedAt.getTime() - a.processedAt.getTime())
      .slice(0, 10); // Últimos 10 arquivos

    return {
      inboxPath,
      processedPath,
      pendingCount: pendingFiles.length,
      pendingFiles,
      processedCount: processedFiles.length,
      processedFiles,
    };
  }

  async depositSftpFile(fileName: string, content: string) {
    const inboxPath = path.join(process.cwd(), 'sftp_inbox');
    if (!fs.existsSync(inboxPath)) {
      fs.mkdirSync(inboxPath, { recursive: true });
    }
    const safeName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    const filePath = path.join(inboxPath, safeName);
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true, fileName: safeName, filePath };
  }
}
