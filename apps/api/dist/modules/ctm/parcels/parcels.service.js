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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsService = void 0;
const common_1 = require("@nestjs/common");
const geo_1 = require("../../../common/utils/geo");
const object_id_1 = require("../../../common/utils/object-id");
const projects_service_1 = require("../../projects/projects.service");
const parcel_buildings_service_1 = require("../parcel-buildings/parcel-buildings.service");
const parcel_infrastructure_service_1 = require("../parcel-infrastructure/parcel-infrastructure.service");
const parcel_socioeconomic_service_1 = require("../parcel-socioeconomic/parcel-socioeconomic.service");
const logradouros_service_1 = require("../logradouros/logradouros.service");
const parcel_audit_repository_1 = require("./parcel-audit.repository");
const parcels_repository_1 = require("./parcels.repository");
const STATUS_VALUES = new Set(['ATIVO', 'INATIVO', 'CONFLITO']);
const parseStatus = (value) => value && STATUS_VALUES.has(value) ? value : undefined;
const normalizeStatus = (value) => parseStatus(value) ?? 'ATIVO';
const WORKFLOW_VALUES = new Set(['PENDENTE', 'EM_VALIDACAO', 'APROVADA', 'REPROVADA']);
const normalizeWorkflowStatus = (value) => (value && WORKFLOW_VALUES.has(value)
    ? value
    : 'PENDENTE');
let ParcelsService = class ParcelsService {
    constructor(parcelsRepository, projectsService, parcelBuildingsService, parcelSocioeconomicService, parcelInfrastructureService, logradourosService, parcelAuditRepository) {
        this.parcelsRepository = parcelsRepository;
        this.projectsService = projectsService;
        this.parcelBuildingsService = parcelBuildingsService;
        this.parcelSocioeconomicService = parcelSocioeconomicService;
        this.parcelInfrastructureService = parcelInfrastructureService;
        this.logradourosService = logradourosService;
        this.parcelAuditRepository = parcelAuditRepository;
    }
    computePendingIssues(parcel) {
        const issues = [];
        const hasAddress = Boolean(parcel.mainAddress || parcel.enderecoPrincipal?.logradouro);
        const hasInscription = Boolean(parcel.inscricaoImobiliaria || parcel.inscription);
        const hasGeometry = Boolean(parcel.geometry);
        const hasArea = (parcel.areaTerreno ?? parcel.area ?? 0) > 0;
        const hasStatus = Boolean(parcel.status || parcel.statusCadastral);
        if (!hasAddress)
            issues.push('SEM_ENDERECO');
        if (!hasInscription)
            issues.push('SEM_INSCRICAO');
        if (!hasGeometry)
            issues.push('SEM_GEOMETRIA');
        if (!hasArea)
            issues.push('SEM_AREA');
        if (!hasStatus)
            issues.push('SEM_STATUS');
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
        });
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
        const pendingIssues = this.computePendingIssues(mergedAfter);
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
                },
            })),
        };
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
    async importGeojson(tenantId, projectId, featureCollection, userId) {
        if (!featureCollection?.features?.length) {
            return { inserted: 0, errors: 0 };
        }
        const resolvedProjectId = await this.projectsService.resolveProjectId(tenantId, projectId);
        let inserted = 0;
        let errors = 0;
        for (const feature of featureCollection.features) {
            const geometry = feature.geometry;
            if (!(0, geo_1.isPolygonGeometry)(geometry)) {
                errors += 1;
                continue;
            }
            const props = feature.properties ?? {};
            const sqlu = String(props.sqlu ?? props.SQLU ?? '').trim();
            const inscription = String(props.inscricaoImobiliaria ?? props.inscription ?? props.inscricao ?? '').trim();
            const mainAddress = String(props.address ?? props.endereco ?? '').trim();
            if (!sqlu || !inscription || !mainAddress) {
                errors += 1;
                continue;
            }
            try {
                const area = (0, geo_1.calculateGeometryArea)(geometry);
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
                    tenantId: (0, object_id_1.asObjectId)(tenantId),
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
                    createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
                });
                inserted += 1;
            }
            catch {
                errors += 1;
            }
        }
        return { inserted, errors };
    }
};
exports.ParcelsService = ParcelsService;
exports.ParcelsService = ParcelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [parcels_repository_1.ParcelsRepository,
        projects_service_1.ProjectsService,
        parcel_buildings_service_1.ParcelBuildingsService,
        parcel_socioeconomic_service_1.ParcelSocioeconomicService,
        parcel_infrastructure_service_1.ParcelInfrastructureService,
        logradouros_service_1.LogradourosService,
        parcel_audit_repository_1.ParcelAuditRepository])
], ParcelsService);
//# sourceMappingURL=parcels.service.js.map