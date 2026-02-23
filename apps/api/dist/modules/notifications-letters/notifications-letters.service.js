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
exports.NotificationsLettersService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const object_id_1 = require("../../common/utils/object-id");
const parcels_repository_1 = require("../ctm/parcels/parcels.repository");
const projects_service_1 = require("../projects/projects.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const notifications_letters_repository_1 = require("./notifications-letters.repository");
const pdf_util_1 = require("./pdf.util");
let NotificationsLettersService = class NotificationsLettersService {
    constructor(repository, projectsService, parcelsRepository, objectStorageService) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.parcelsRepository = parcelsRepository;
        this.objectStorageService = objectStorageService;
    }
    async resolveProject(tenantId, projectId) {
        return this.projectsService.resolveProjectId(tenantId, projectId);
    }
    buildVariablesFromParcel(parcel) {
        return {
            sqlu: parcel.sqlu ?? '',
            inscricao: parcel.inscricaoImobiliaria ?? parcel.inscription ?? '',
            endereco: parcel.mainAddress ?? '',
            status: parcel.status ?? '',
        };
    }
    updateBatchStatus(batch) {
        const hasReturned = batch.letters.some((letter) => letter.status === 'DEVOLVIDA');
        if (hasReturned) {
            batch.status = 'DEVOLVIDA';
            return;
        }
        const allDelivered = batch.letters.length > 0 && batch.letters.every((letter) => letter.status === 'ENTREGUE');
        if (allDelivered) {
            batch.status = 'ENTREGUE';
            return;
        }
        batch.status = 'GERADA';
    }
    async listTemplates(tenantId, projectId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        return this.repository.listTemplates(tenantId, String(resolvedProject));
    }
    async createTemplate(tenantId, dto) {
        const resolvedProject = await this.resolveProject(tenantId, dto.projectId);
        const variables = Array.from(new Set((dto.html.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) ?? []).map((item) => item.replace(/[{} ]/g, ''))));
        const version = await this.repository.getNextTemplateVersion(tenantId, String(resolvedProject), dto.name);
        return this.repository.createTemplate({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProject,
            name: dto.name,
            version,
            html: dto.html,
            variables,
            isActive: true,
        });
    }
    async updateTemplate(tenantId, projectId, templateId, dto) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const updated = await this.repository.updateTemplate(tenantId, String(resolvedProject), templateId, dto);
        if (!updated)
            throw new common_1.BadRequestException('Template nao encontrado');
        return updated;
    }
    previewTemplate(dto) {
        return {
            renderedHtml: (0, pdf_util_1.renderTemplate)(dto.html, dto.variables ?? {}),
        };
    }
    async generateBatch(tenantId, dto, actorId) {
        const resolvedProject = await this.resolveProject(tenantId, dto.projectId);
        const projectId = String(resolvedProject);
        const template = await this.repository.findTemplateById(tenantId, projectId, dto.templateId);
        if (!template)
            throw new common_1.BadRequestException('Template nao encontrado');
        const parcels = await this.parcelsRepository.list(tenantId, {
            projectId,
            status: dto.parcelStatus,
        });
        const protocol = `NOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${(0, crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`;
        const letters = [];
        for (const parcel of parcels) {
            const letterId = (0, crypto_1.randomUUID)();
            const variables = this.buildVariablesFromParcel(parcel);
            const renderedText = (0, pdf_util_1.renderTemplate)(template.html, variables);
            const pdf = (0, pdf_util_1.buildSimplePdf)(renderedText);
            const key = `tenants/${tenantId}/letters/${protocol}/${letterId}.pdf`;
            await this.objectStorageService.putObject({
                key,
                content: pdf,
                contentType: 'application/pdf',
            });
            letters.push({
                id: letterId,
                parcelId: parcel.id,
                sqlu: parcel.sqlu,
                address: parcel.mainAddress,
                status: 'GERADA',
                fileKey: key,
                generatedAt: new Date().toISOString(),
            });
        }
        return this.repository.createBatch({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProject,
            templateId: (0, object_id_1.asObjectId)(template.id),
            templateName: template.name,
            templateVersion: template.version,
            protocol,
            status: 'GERADA',
            filter: {
                parcelWorkflowStatus: dto.parcelWorkflowStatus,
                parcelStatus: dto.parcelStatus,
            },
            letters,
            createdBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
    }
    async listBatches(tenantId, projectId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        return this.repository.listBatches(tenantId, String(resolvedProject));
    }
    async findBatchById(tenantId, projectId, batchId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const batch = await this.repository.findBatchById(tenantId, String(resolvedProject), batchId);
        if (!batch)
            throw new common_1.BadRequestException('Lote nao encontrado');
        return batch;
    }
    async updateLetterStatus(tenantId, projectId, batchId, letterId, dto) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const batch = await this.repository.findBatchById(tenantId, String(resolvedProject), batchId);
        if (!batch)
            throw new common_1.BadRequestException('Lote nao encontrado');
        const index = batch.letters.findIndex((item) => item.id === letterId);
        if (index < 0)
            throw new common_1.BadRequestException('Carta nao encontrada');
        batch.letters[index].status = dto.status;
        if (dto.status === 'ENTREGUE') {
            batch.letters[index].deliveredAt = new Date().toISOString();
        }
        if (dto.status === 'DEVOLVIDA') {
            batch.letters[index].returnedAt = new Date().toISOString();
        }
        this.updateBatchStatus(batch);
        return this.repository.saveBatch(batch);
    }
    async getLetterDownloadUrl(tenantId, projectId, batchId, letterId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const batch = await this.repository.findBatchById(tenantId, String(resolvedProject), batchId);
        if (!batch)
            throw new common_1.BadRequestException('Lote nao encontrado');
        const letter = batch.letters.find((item) => item.id === letterId);
        if (!letter)
            throw new common_1.BadRequestException('Carta nao encontrada');
        return this.objectStorageService.createPresignedDownload({ key: letter.fileKey });
    }
};
exports.NotificationsLettersService = NotificationsLettersService;
exports.NotificationsLettersService = NotificationsLettersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notifications_letters_repository_1.NotificationsLettersRepository,
        projects_service_1.ProjectsService,
        parcels_repository_1.ParcelsRepository,
        object_storage_service_1.ObjectStorageService])
], NotificationsLettersService);
//# sourceMappingURL=notifications-letters.service.js.map