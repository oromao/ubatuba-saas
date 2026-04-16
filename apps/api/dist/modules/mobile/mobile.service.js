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
exports.MobileService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const object_id_1 = require("../../common/utils/object-id");
const parcels_repository_1 = require("../ctm/parcels/parcels.repository");
const projects_service_1 = require("../projects/projects.service");
const mobile_repository_1 = require("./mobile.repository");
let MobileService = class MobileService {
    constructor(repository, projectsService, parcelsRepository) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.parcelsRepository = parcelsRepository;
    }
    async sync(tenantId, dto, actorId) {
        const resolvedProject = await this.projectsService.resolveProjectId(tenantId, dto.projectId);
        const results = [];
        let evidencesProcessed = 0;
        let evidencesFailed = 0;
        for (const item of dto.items) {
            try {
                const currentParcel = await this.parcelsRepository.findById(tenantId, String(resolvedProject), item.parcelId);
                const clientParcelUpdatedAt = item.parcelUpdatedAt ? new Date(item.parcelUpdatedAt).getTime() : null;
                const serverParcelUpdatedAt = currentParcel?.updatedAt
                    ? new Date(currentParcel.updatedAt).getTime()
                    : null;
                if (currentParcel &&
                    clientParcelUpdatedAt &&
                    serverParcelUpdatedAt &&
                    serverParcelUpdatedAt > clientParcelUpdatedAt) {
                    const conflictEvidences = (item.evidences ?? []).map((evidence) => ({
                        ...evidence,
                        status: 'ERRO',
                        retries: (evidence.retries ?? 0) + 1,
                        lastError: 'CONFLITO_DE_VERSAO_CADASTRAL',
                        lastAttemptAt: new Date().toISOString(),
                    }));
                    evidencesFailed += conflictEvidences.length;
                    await this.repository.create({
                        tenantId: (0, object_id_1.asObjectId)(tenantId),
                        projectId: resolvedProject,
                        parcelId: (0, object_id_1.asObjectId)(item.parcelId),
                        clientId: item.clientId,
                        checklist: item.checklist ?? {},
                        location: item.location,
                        photoBase64: item.photoBase64,
                        parcelUpdatedAt: item.parcelUpdatedAt,
                        evidences: conflictEvidences,
                        syncStatus: 'CONFLITO',
                        syncAttempts: 1,
                        syncError: 'Registro local desatualizado em relacao ao cadastro atual',
                        syncContext: {
                            clientParcelUpdatedAt: item.parcelUpdatedAt,
                            serverParcelUpdatedAt: currentParcel?.updatedAt,
                        },
                        syncTimeline: [
                            {
                                at: new Date().toISOString(),
                                status: 'CONFLITO',
                                message: 'Conflito de versao cadastral identificado durante sincronizacao',
                                actorId,
                            },
                        ],
                        syncedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
                    });
                    results.push({
                        clientId: item.clientId,
                        status: 'ERRO',
                        error: 'CONFLITO_DE_VERSAO_CADASTRAL',
                        evidenceCount: conflictEvidences.length,
                        details: {
                            clientParcelUpdatedAt: item.parcelUpdatedAt,
                            serverParcelUpdatedAt: currentParcel?.updatedAt,
                        },
                    });
                    continue;
                }
                const normalizedEvidences = (item.evidences ?? []).map((evidence) => ({
                    ...evidence,
                    checksum: evidence.checksum ?? (0, crypto_1.createHash)('sha256').update(evidence.base64).digest('hex'),
                    capturedAt: evidence.capturedAt ?? new Date().toISOString(),
                    size: evidence.size ?? evidence.base64.length,
                    status: evidence.status ?? 'SINCRONIZADO',
                    retries: evidence.retries ?? 0,
                    lastAttemptAt: evidence.lastAttemptAt ?? new Date().toISOString(),
                }));
                await this.repository.create({
                    tenantId: (0, object_id_1.asObjectId)(tenantId),
                    projectId: resolvedProject,
                    parcelId: (0, object_id_1.asObjectId)(item.parcelId),
                    clientId: item.clientId,
                    checklist: item.checklist ?? {},
                    location: item.location,
                    photoBase64: item.photoBase64,
                    parcelUpdatedAt: item.parcelUpdatedAt,
                    evidences: normalizedEvidences,
                    syncStatus: 'PROCESSADO',
                    syncAttempts: 1,
                    syncedAt: new Date().toISOString(),
                    syncTimeline: [
                        {
                            at: new Date().toISOString(),
                            status: 'PROCESSADO',
                            message: 'Registro de campo sincronizado com sucesso',
                            actorId,
                        },
                    ],
                    syncedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
                });
                evidencesProcessed += normalizedEvidences.length;
                results.push({ clientId: item.clientId, status: 'PROCESSADO', evidenceCount: normalizedEvidences.length });
            }
            catch (error) {
                const evidenceCount = item.evidences?.length ?? 0;
                evidencesFailed += evidenceCount;
                results.push({
                    clientId: item.clientId,
                    status: 'ERRO',
                    error: error instanceof Error ? error.message : 'Falha ao persistir',
                    evidenceCount,
                });
            }
        }
        return {
            processed: results.filter((item) => item.status === 'PROCESSADO').length,
            failed: results.filter((item) => item.status === 'ERRO'),
            evidenceSummary: {
                processed: evidencesProcessed,
                failed: evidencesFailed,
            },
        };
    }
    async listRecords(tenantId, projectId) {
        const resolvedProject = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.list(tenantId, String(resolvedProject));
    }
    async summary(tenantId, projectId) {
        const resolvedProject = await this.projectsService.resolveProjectId(tenantId, projectId);
        return this.repository.summary(tenantId, String(resolvedProject));
    }
};
exports.MobileService = MobileService;
exports.MobileService = MobileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mobile_repository_1.MobileRepository,
        projects_service_1.ProjectsService,
        parcels_repository_1.ParcelsRepository])
], MobileService);
//# sourceMappingURL=mobile.service.js.map