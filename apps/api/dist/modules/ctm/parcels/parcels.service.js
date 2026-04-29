"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ParcelsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsService = void 0;
const common_1 = require("@nestjs/common");
const geo_1 = require("../../../common/utils/geo");
const object_id_1 = require("../../../common/utils/object-id");
const mvt_util_1 = require("../../../common/utils/mvt.util");
const crs_1 = require("../../../common/utils/crs");
const projects_service_1 = require("../../projects/projects.service");
const parcel_buildings_service_1 = require("../parcel-buildings/parcel-buildings.service");
const parcel_infrastructure_service_1 = require("../parcel-infrastructure/parcel-infrastructure.service");
const parcel_socioeconomic_service_1 = require("../parcel-socioeconomic/parcel-socioeconomic.service");
const logradouros_service_1 = require("../logradouros/logradouros.service");
const parcel_audit_repository_1 = require("./parcel-audit.repository");
const parcels_repository_1 = require("./parcels.repository");
const import_batch_repository_1 = require("./import-batch.repository");
function isParcelGeoJson(value) {
    if (!value || typeof value !== 'object')
        return false;
    const candidate = value;
    if (candidate.type !== 'FeatureCollection' || !Array.isArray(candidate.features))
        return false;
    return candidate.features.every((feature) => {
        if (!feature || typeof feature !== 'object')
            return false;
        const item = feature;
        return item.type === 'Feature' && typeof item.properties === 'object' && item.properties !== null;
    });
}
const STATUS_VALUES = new Set(['ATIVO', 'INATIVO', 'CONFLITO']);
const IPTUSTATUS_VALUES = new Set(['QUITADO', 'PARCELADO', 'INADIMPLENTE', 'ISENTO', 'EXIGIVEL', 'NAO_CADASTRADO']);
const parseStatus = (value) => value && STATUS_VALUES.has(value) ? value : undefined;
const normalizeStatus = (value) => parseStatus(value) ?? 'ATIVO';
const normalizeIptuStatus = (value) => value && IPTUSTATUS_VALUES.has(value) ? value : undefined;
const WORKFLOW_VALUES = new Set(['PENDENTE', 'EM_VALIDACAO', 'APROVADA', 'REPROVADA']);
const normalizeWorkflowStatus = (value) => (value && WORKFLOW_VALUES.has(value)
    ? value
    : 'PENDENTE');
const PROPERTY_ALIASES = {
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
function getPropertyValue(props, ...keys) {
    for (const key of keys) {
        const value = props[key];
        if (value !== undefined && value !== null && String(value).trim()) {
            return String(value).trim();
        }
    }
    return undefined;
}
function parseNumber(value) {
    if (value === undefined || value === null)
        return undefined;
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[R$\s]/g, '').replace(',', '.'));
    return isNaN(num) ? undefined : num;
}
function calculateCentroid(geometry) {
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
        return { type: 'Point', coordinates: [0, 0] };
    }
    let allCoords = [];
    if (geometry.type === 'Polygon') {
        allCoords = geometry.coordinates[0];
    }
    else if (geometry.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates) {
            if (polygon[0]) {
                allCoords.push(...polygon[0]);
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
function calculateBbox(geometry) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const polygons = geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.coordinates;
    for (const polygon of polygons) {
        for (const ring of polygon) {
            for (const coord of ring) {
                if (coord[0] < minX)
                    minX = coord[0];
                if (coord[0] > maxX)
                    maxX = coord[0];
                if (coord[1] < minY)
                    minY = coord[1];
                if (coord[1] > maxY)
                    maxY = coord[1];
            }
        }
    }
    if (minX === Infinity)
        return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    return { minX, minY, maxX, maxY };
}
let ParcelsService = ParcelsService_1 = class ParcelsService {
    constructor(parcelsRepository, projectsService, parcelBuildingsService, parcelSocioeconomicService, parcelInfrastructureService, logradourosService, parcelAuditRepository, importBatchRepository) {
        this.parcelsRepository = parcelsRepository;
        this.projectsService = projectsService;
        this.parcelBuildingsService = parcelBuildingsService;
        this.parcelSocioeconomicService = parcelSocioeconomicService;
        this.parcelInfrastructureService = parcelInfrastructureService;
        this.logradourosService = logradourosService;
        this.parcelAuditRepository = parcelAuditRepository;
        this.importBatchRepository = importBatchRepository;
        this.logger = new common_1.Logger(ParcelsService_1.name);
    }
    computePendingIssues(parcel) {
        const issues = [];
        const hasAddress = Boolean(parcel.mainAddress || parcel.enderecoPrincipal?.logradouro);
        const hasInscription = Boolean(parcel.inscricaoImobiliaria || parcel.inscription);
        const hasGeometry = Boolean(parcel.geometry);
        const hasArea = (parcel.areaTerreno ?? parcel.area ?? 0) > 0;
        const hasStatus = Boolean(parcel.status || parcel.statusCadastral);
        const isDemo = parcel.sourceType === 'DEMO' || parcel.sourceType === 'DEMO_EXTERNAL' || parcel.sourceType === 'OFFICIAL_SAMPLE';
        if (!hasAddress && !isDemo)
            issues.push('SEM_ENDERECO');
        if (!hasInscription && !isDemo)
            issues.push('SEM_INSCRICAO');
        if (!hasGeometry && !isDemo)
            issues.push('SEM_GEOMETRIA');
        if (!hasArea && !isDemo)
            issues.push('SEM_AREA');
        if (!hasStatus)
            issues.push('SEM_STATUS');
        if (!parcel.sqlu)
            issues.push('SEM_SQLU');
        return issues;
    }
    buildDiff(before, after) {
        const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
        const diff = {};
        keys.forEach((key) => {
            const prev = before[key];
            const next = after[key];
            if (JSON.stringify(prev) !== JSON.stringify(next)) {
                diff[key] = { before: prev, after: next };
            }
        });
        return diff;
    }
    async list(tenantId, projectId, filters) {
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
    async getStatistics(tenantId, projectId) {
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
        }, {});
        const byStatus = parcels.reduce((acc, p) => {
            const status = p.statusIPTU || 'SEM IPTU';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
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
    async listPendencias(tenantId, projectId) {
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
    async findById(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
    }
    async getHistory(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.parcelAuditRepository.listByParcel(tenantId, String(resolvedProjectId), id);
    }
    async create(tenantId, dto, userId) {
        if (!(0, geo_1.isPolygonGeometry)(dto.geometry)) {
            throw new common_1.BadRequestException('Geometria invalida para parcela');
        }
        const inscription = dto.inscricaoImobiliaria ?? dto.inscription;
        if (!inscription) {
            throw new common_1.BadRequestException('Inscricao imobiliaria obrigatoria');
        }
        const enderecoPrincipal = dto.enderecoPrincipal;
        const mainAddress = dto.mainAddress ??
            [enderecoPrincipal?.logradouro, enderecoPrincipal?.numero].filter(Boolean).join(', ');
        if (!mainAddress && !enderecoPrincipal) {
            throw new common_1.BadRequestException('Endereco principal obrigatorio');
        }
        const projectId = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const area = (0, geo_1.calculateGeometryArea)(dto.geometry);
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
            tenantId: (0, object_id_1.asObjectId)(tenantId),
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
            logradouroId: dto.logradouroId ? (0, object_id_1.asObjectId)(dto.logradouroId) : undefined,
            zoneId: dto.zoneId ? (0, object_id_1.asObjectId)(dto.zoneId) : undefined,
            faceId: dto.faceId ? (0, object_id_1.asObjectId)(dto.faceId) : undefined,
            geometry: dto.geometry,
            areaTerreno: area,
            area,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
        await this.parcelAuditRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            parcelId: (0, object_id_1.asObjectId)(created.id),
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
            actorId: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
        return created;
    }
    async update(tenantId, projectId, id, dto, userId) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const existing = await this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
        if (!existing) {
            throw new common_1.BadRequestException('Parcela nao encontrada');
        }
        const enderecoPrincipal = dto.enderecoPrincipal;
        const computedMainAddress = dto.mainAddress ??
            (enderecoPrincipal
                ? [enderecoPrincipal.logradouro, enderecoPrincipal.numero].filter(Boolean).join(', ')
                : undefined);
        const statusCadastral = parseStatus(dto.statusCadastral ?? dto.status);
        const update = {
            sqlu: dto.sqlu,
            inscription: dto.inscription ?? dto.inscricaoImobiliaria,
            inscricaoImobiliaria: dto.inscricaoImobiliaria ?? dto.inscription,
            enderecoPrincipal,
            status: dto.status ?? dto.statusCadastral,
            statusCadastral,
            observacoes: dto.observacoes,
            workflowStatus: dto.workflowStatus ? normalizeWorkflowStatus(dto.workflowStatus) : existing.workflowStatus,
            logradouroId: dto.logradouroId ? (0, object_id_1.asObjectId)(dto.logradouroId) : undefined,
            zoneId: dto.zoneId ? (0, object_id_1.asObjectId)(dto.zoneId) : undefined,
            faceId: dto.faceId ? (0, object_id_1.asObjectId)(dto.faceId) : undefined,
        };
        if (computedMainAddress !== undefined) {
            update.mainAddress = computedMainAddress;
        }
        if (dto.geometry) {
            if (!(0, geo_1.isPolygonGeometry)(dto.geometry)) {
                throw new common_1.BadRequestException('Geometria invalida para parcela');
            }
            update.geometry = dto.geometry;
            update.areaTerreno = (0, geo_1.calculateGeometryArea)(dto.geometry);
            update.area = (0, geo_1.calculateGeometryArea)(dto.geometry);
        }
        const mergedAfter = {
            mainAddress: update.mainAddress ?? existing.mainAddress,
            enderecoPrincipal: update.enderecoPrincipal ?? existing.enderecoPrincipal,
            inscricaoImobiliaria: update.inscricaoImobiliaria ?? existing.inscricaoImobiliaria,
            inscription: update.inscription ?? existing.inscription,
            geometry: update.geometry ?? existing.geometry,
            areaTerreno: update.areaTerreno ?? existing.areaTerreno,
            area: update.area ?? existing.area,
            status: update.status ?? existing.status,
            statusCadastral: update.statusCadastral ?? existing.statusCadastral,
        };
        const pendingIssues = this.computePendingIssues({
            ...mergedAfter,
            sqlu: update.sqlu ?? existing.sqlu,
            sourceType: existing.sourceType,
        });
        update.pendingIssues = pendingIssues;
        if (!dto.workflowStatus) {
            update.workflowStatus = pendingIssues.length > 0 ? 'PENDENTE' : existing.workflowStatus ?? 'PENDENTE';
        }
        const updated = await this.parcelsRepository.update(tenantId, String(resolvedProjectId), id, update);
        if (!updated) {
            throw new common_1.BadRequestException('Parcela nao encontrada');
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
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(resolvedProjectId),
            parcelId: (0, object_id_1.asObjectId)(updated.id),
            action: 'UPDATE',
            before: beforeSnapshot,
            after: afterSnapshot,
            diff,
            actorId: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
        return updated;
    }
    async remove(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        await this.parcelsRepository.delete(tenantId, String(resolvedProjectId), id);
        return { success: true };
    }
    async geojson(tenantId, projectId, filters) {
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
    async vectorTiles(tenantId, projectId, z, x, y) {
        const geojsonData = await this.geojson(tenantId, projectId);
        return (0, mvt_util_1.createVectorTile)(geojsonData, z, x, y);
    }
    async getSummary(tenantId, projectId, id) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const parcel = await this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
        if (!parcel) {
            throw new common_1.BadRequestException('Parcela nao encontrada');
        }
        const [building, socioeconomic, infrastructure, logradouro] = await Promise.all([
            this.parcelBuildingsService.findByParcel(tenantId, String(resolvedProjectId), parcel.id),
            this.parcelSocioeconomicService.findByParcel(tenantId, String(resolvedProjectId), parcel.id),
            this.parcelInfrastructureService.findByParcel(tenantId, String(resolvedProjectId), parcel.id),
            parcel.logradouroId
                ? this.logradourosService.findById(tenantId, String(resolvedProjectId), String(parcel.logradouroId))
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
    detectAndConvertCRS(geometry, municipalityName) {
        const crsWarnings = [];
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
        const looksLikeWgs84 = Math.abs(x) <= 180 && Math.abs(y) <= 90;
        if (looksLikeWgs84) {
            if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
                return { geometry, transformed: false, crsWarnings };
            }
        }
        let detectedCrs = null;
        let zone = 23;
        if (x >= 100000 && x <= 900000 && y >= 7000000 && y <= 11000000) {
            zone = x < 500000 ? 23 : 24;
            detectedCrs = zone === 23 ? crs_1.CRS_SIRGAS2000_UTM_23S : crs_1.CRS_SIRGAS2000_UTM_24S;
        }
        if (municipalityName) {
            const normalized = municipalityName.toLowerCase();
            if (normalized.includes('sao paulo') || normalized.includes('sp') || normalized.includes('paulo')) {
                zone = 23;
                detectedCrs = crs_1.CRS_SIRGAS2000_UTM_23S;
            }
        }
        if (detectedCrs) {
            const targetCrs = crs_1.CRS_WGS84;
            const converted = (0, crs_1.convertGeometryCoordinates)(geometry, detectedCrs, targetCrs);
            if (converted && (converted.type === 'Polygon' || converted.type === 'MultiPolygon')) {
                crsWarnings.push(`Converted from ${detectedCrs} (Zone ${zone}S) to ${targetCrs} for ${municipalityName || 'unknown municipality'}`);
                return { geometry: converted, transformed: true, crsWarnings };
            }
        }
        if (!looksLikeWgs84 && !detectedCrs) {
            const fallbackCrs = crs_1.CRS_SIRGAS2000_UTM_23S;
            const converted = (0, crs_1.convertGeometryCoordinates)(geometry, fallbackCrs, crs_1.CRS_WGS84);
            if (converted && (converted.type === 'Polygon' || converted.type === 'MultiPolygon')) {
                crsWarnings.push(`Fallback conversion from ${fallbackCrs} to WGS84 (coordinates out of bounds)`);
                return { geometry: converted, transformed: true, crsWarnings };
            }
        }
        return { geometry, transformed: false, crsWarnings };
    }
    async importGeojson(tenantId, projectId, featureCollection, sourceType = 'GEOJSON', fileName, upsert = false, userId, municipalityName, municipalityCode) {
        if (!isParcelGeoJson(featureCollection)) {
            throw new common_1.BadRequestException('GeoJSON de parcelas invalido');
        }
        if (!featureCollection?.features?.length) {
            return { batchId: null, inserted: 0, updated: 0, skipped: 0, errors: 0, errorDetails: [] };
        }
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const batch = await this.importBatchRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
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
        const errorDetails = [];
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
                if (!(0, geo_1.isPolygonGeometry)(geometry)) {
                    errors++;
                    errorDetails.push({ row: i + 1, featureId: String(featureId), message: 'Geometria inválida ou ausente', field: 'geometry' });
                    continue;
                }
                let geo = geometry;
                const crsResult = this.detectAndConvertCRS(geo, municipalityName);
                if (crsResult.transformed) {
                    geo = crsResult.geometry;
                    await this.importBatchRepository.addWarning(batchId, `_row=${i + 1}_FEAT=${featureId}: ${crsResult.crsWarnings.join('; ')}`);
                }
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
                const areaCartografica = (0, geo_1.calculateGeometryArea)(geo);
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
                const validationErrors = [];
                if (!sqlu)
                    validationErrors.push('SQLU ausente');
                if (!inscription)
                    validationErrors.push('Inscrição ausente');
                if (areaTerreno <= 0)
                    validationErrors.push('Área menor ou igual a zero');
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
                const parcelData = {
                    tenantId: (0, object_id_1.asObjectId)(tenantId),
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
                    sourceType: sourceType,
                    importBatchId: batchId,
                    isOfficial,
                    validationStatus,
                    validationErrors,
                    createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
                };
                if (isExternalDemo) {
                    parcelData.municipalityName = municipalityName || 'São Paulo';
                    parcelData.municipalityCode = municipalityCode;
                    parcelData.isOfficial = false;
                }
                if (existing && upsert) {
                    await this.parcelsRepository.update(tenantId, String(resolvedProjectId), existing.id, parcelData);
                    inserted++;
                }
                else {
                    await this.parcelsRepository.create(parcelData);
                    inserted++;
                }
            }
            catch (err) {
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
    async transicao(tenantId, projectId, id, newStatus, observacao, userId, userRole) {
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const parcel = await this.parcelsRepository.findById(tenantId, String(resolvedProjectId), id);
        if (!parcel)
            throw new common_1.BadRequestException('Parcela nao encontrada');
        const current = parcel.workflowStatus ?? 'PENDENTE';
        const adminOrGestor = userRole === 'ADMIN' || userRole === 'GESTOR';
        const allowedTransitions = {
            PENDENTE: ['EM_VALIDACAO'],
            EM_VALIDACAO: ['APROVADA', 'REPROVADA', 'PENDENTE'],
            APROVADA: ['PENDENTE'],
            REPROVADA: ['PENDENTE', 'EM_VALIDACAO'],
        };
        const allowed = allowedTransitions[current] ?? [];
        if (!allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Transicao invalida: ${current} -> ${newStatus}`);
        }
        if ((newStatus === 'APROVADA' || newStatus === 'REPROVADA') && !adminOrGestor) {
            throw new common_1.BadRequestException('Apenas GESTOR ou ADMIN podem aprovar ou reprovar');
        }
        const before = { workflowStatus: current };
        const updated = await this.parcelsRepository.update(tenantId, String(resolvedProjectId), id, {
            workflowStatus: newStatus,
        });
        if (!updated)
            throw new common_1.BadRequestException('Parcela nao encontrada');
        await this.parcelAuditRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(resolvedProjectId),
            parcelId: (0, object_id_1.asObjectId)(id),
            action: 'TRANSICAO',
            before,
            after: { workflowStatus: newStatus, observacao },
            diff: { workflowStatus: { before: current, after: newStatus } },
            actorId: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
        return updated;
    }
    async importFromCsvEnrichment(tenantId, projectId, csvContent, sourceType = 'CSV_ENRICHMENT', fileName, columnMapping, userId) {
        const lines = csvContent.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
            return { batchId: null, processed: 0, updated: 0, notFound: 0, errors: 0, errorDetails: [{ row: 0, message: 'CSV sem dados' }] };
        }
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        const batch = await this.importBatchRepository.create({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
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
        const getIdx = (mapping) => {
            const mappedCol = columnMapping?.[mapping]?.toLowerCase();
            if (mappedCol) {
                const idx = header.indexOf(mappedCol);
                if (idx >= 0)
                    return idx;
            }
            const aliases = PROPERTY_ALIASES[mapping] || [mapping];
            for (const alias of aliases) {
                const idx = header.indexOf(alias.toLowerCase());
                if (idx >= 0)
                    return idx;
            }
            return -1;
        };
        let processed = 0;
        let updated = 0;
        let notFound = 0;
        let errors = 0;
        const errorDetails = [];
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
                const updateData = {
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
                            ...(updateData.enderecoPrincipal || existing.enderecoPrincipal || {}),
                            bairro,
                        };
                    }
                }
                if (getIdx('zoneamento') >= 0) {
                    const zoneamento = cols[getIdx('zoneamento')];
                    if (zoneamento)
                        updateData.zoneamento = zoneamento;
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
                    if (areaConstruida)
                        updateData.areaConstruida = areaConstruida;
                }
                if (getIdx('valorVenalTerreno') >= 0) {
                    const vvt = parseNumber(cols[getIdx('valorVenalTerreno')]);
                    if (vvt !== undefined)
                        updateData.valorVenalTerreno = vvt;
                }
                if (getIdx('valorVenalConstrucao') >= 0) {
                    const vvc = parseNumber(cols[getIdx('valorVenalConstrucao')]);
                    if (vvc !== undefined)
                        updateData.valorVenalConstrucao = vvc;
                }
                if (getIdx('valorVenalTotal') >= 0) {
                    const vvt = parseNumber(cols[getIdx('valorVenalTotal')]);
                    if (vvt !== undefined)
                        updateData.valorVenalTotal = vvt;
                }
                if (getIdx('iptuLancado') >= 0) {
                    const iptuLancado = parseNumber(cols[getIdx('iptuLancado')]);
                    if (iptuLancado !== undefined)
                        updateData.iptuLancado = iptuLancado;
                }
                if (getIdx('iptuPago') >= 0) {
                    const iptuPago = parseNumber(cols[getIdx('iptuPago')]);
                    if (iptuPago !== undefined)
                        updateData.iptuPago = iptuPago;
                }
                if (getIdx('iptuEmAberto') >= 0) {
                    const iptuEmAberto = parseNumber(cols[getIdx('iptuEmAberto')]);
                    if (iptuEmAberto !== undefined)
                        updateData.iptuEmAberto = iptuEmAberto;
                }
                if (getIdx('statusIPTU') >= 0) {
                    const statusIPTU = normalizeIptuStatus(cols[getIdx('statusIPTU')]);
                    if (statusIPTU)
                        updateData.statusIPTU = statusIPTU;
                }
                if (getIdx('exercicioIPTU') >= 0) {
                    const exercicio = parseInt(cols[getIdx('exercicioIPTU')]);
                    if (!isNaN(exercicio))
                        updateData.exercicioIPTU = exercicio;
                }
                updateData.validationStatus = 'VALID';
                updateData.validationErrors = [];
                await this.parcelsRepository.update(tenantId, String(resolvedProjectId), existing.id, updateData);
                updated++;
            }
            catch (err) {
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
    async generatePdf(tenantId, parcelId) {
        const parcel = await this.findById(tenantId, undefined, parcelId);
        if (!parcel)
            throw new common_1.NotFoundException('Lote não encontrado');
        return new Promise((resolve, reject) => {
            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const chunks = [];
            doc.on('data', (c) => chunks.push(c));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const address = parcel.mainAddress || [
                parcel.enderecoPrincipal?.logradouro,
                parcel.enderecoPrincipal?.numero,
                parcel.enderecoPrincipal?.bairro,
            ].filter(Boolean).join(', ') || 'Não informado';
            doc.fontSize(9).fillColor('#666').text('PREFEITURA MUNICIPAL', { align: 'center' });
            doc.fontSize(14).fillColor('#000').font('Helvetica-Bold')
                .text('FICHA DE IMÓVEL — CADASTRO TÉCNICO MUNICIPAL', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica').fillColor('#666')
                .text(`Emitido em: ${new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, { align: 'right' });
            doc.moveDown(0.3);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text('IDENTIFICAÇÃO DO IMÓVEL');
            doc.moveDown(0.3);
            const fields = [
                ['SQLU', parcel.sqlu || '—'],
                ['Inscrição Imobiliária', parcel.inscricaoImobiliaria || '—'],
                ['Endereço', address],
                ['Bairro', parcel.enderecoPrincipal?.bairro || '—'],
                ['Área Terreno', parcel.areaTerreno ? `${Number(parcel.areaTerreno).toFixed(2)} m²` : '—'],
                ['Área Construída', parcel.areaConstruida ? `${Number(parcel.areaConstruida).toFixed(2)} m²` : '—'],
                ['Status Cadastral', parcel.statusCadastral || '—'],
                ['Status Workflow', parcel.workflowStatus || '—'],
                ['Origem do Dado', parcel.sourceType || '—'],
                ['Zoneamento', parcel.zoneamento || '—'],
            ];
            doc.fontSize(10).font('Helvetica');
            fields.forEach(([label, value]) => {
                doc.fillColor('#666').text(`${label}: `, { continued: true })
                    .fillColor('#000').text(value);
            });
            const hasIptu = parcel.statusIPTU && parcel.statusIPTU !== 'NAO_CADASTRADO';
            if (hasIptu) {
                doc.moveDown(0.5);
                doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
                doc.moveDown(0.3);
                doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a1a').text('TRIBUTAÇÃO');
                doc.moveDown(0.3);
                doc.fontSize(10).font('Helvetica');
                const fmt = (v) => v ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';
                [
                    ['Status IPTU', parcel.statusIPTU || '—'],
                    ['Valor Venal', fmt(parcel.valorVenalTotal)],
                    ['IPTU Lançado', fmt(parcel.iptuLancado)],
                    ['IPTU Pago', fmt(parcel.iptuPago)],
                    ['IPTU Em Aberto', fmt(parcel.iptuEmAberto)],
                ].forEach(([label, value]) => {
                    doc.fillColor('#666').text(`${label}: `, { continued: true })
                        .fillColor('#000').text(value);
                });
            }
            doc.moveDown(2);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#ccc').stroke();
            doc.moveDown(0.3);
            doc.fontSize(8).fillColor('#999')
                .text('Este documento é gerado automaticamente pelo sistema FlyDea — Cadastro Técnico Municipal. Não substitui certidão oficial.', { align: 'center' });
            doc.end();
        });
    }
    async getAuditLog(tenantId, filters) {
        const entries = await this.parcelAuditRepository.listAll(tenantId, filters);
        const total = await this.parcelAuditRepository.countAll(tenantId, filters);
        return { entries, total, limit: filters.limit ?? 50, offset: filters.offset ?? 0 };
    }
    async bulkTransicao(tenantId, ids, newStatus, observacao, userId, userRole) {
        const results = await Promise.allSettled(ids.map((id) => this.transicao(tenantId, undefined, id, newStatus, observacao, userId, userRole)));
        const successful = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        return {
            total: ids.length,
            successful,
            failed,
            results: results.map((r, i) => ({
                id: ids[i],
                status: r.status === 'fulfilled' ? 'ok' : 'erro',
                message: r.status === 'rejected' ? r.reason.message : undefined,
            })),
        };
    }
};
exports.ParcelsService = ParcelsService;
exports.ParcelsService = ParcelsService = ParcelsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parcels_repository_1.ParcelsRepository,
        projects_service_1.ProjectsService,
        parcel_buildings_service_1.ParcelBuildingsService,
        parcel_socioeconomic_service_1.ParcelSocioeconomicService,
        parcel_infrastructure_service_1.ParcelInfrastructureService,
        logradouros_service_1.LogradourosService,
        parcel_audit_repository_1.ParcelAuditRepository,
        import_batch_repository_1.ImportBatchRepository])
], ParcelsService);
//# sourceMappingURL=parcels.service.js.map