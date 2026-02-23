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
exports.ReurbService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const events_1 = require("events");
const mongoose_1 = require("mongoose");
const object_id_1 = require("../../common/utils/object-id");
const projects_service_1 = require("../projects/projects.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const reurb_repository_1 = require("./reurb.repository");
const reurb_utils_1 = require("./reurb.utils");
const reurb_validation_service_1 = require("./reurb-validation.service");
let ReurbService = class ReurbService {
    constructor(repository, projectsService, storage, validationService) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.storage = storage;
        this.validationService = validationService;
        this.pendencyEvents = new events_1.EventEmitter();
    }
    getPendencyEvents() {
        return this.pendencyEvents;
    }
    sanitizeName(value) {
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, 80);
    }
    async resolveProjectId(tenantId, projectId) {
        const resolved = await this.projectsService.resolveProjectId(tenantId, projectId);
        return String(resolved);
    }
    async loadConfig(tenantId) {
        const config = await this.repository.findTenantConfig(tenantId);
        if (config)
            return config;
        return this.repository.upsertTenantConfig(tenantId, {
            reurbEnabled: false,
            requiredFamilyFields: ['familyCode', 'nucleus', 'responsibleName', 'status'],
            spreadsheet: {
                templateVersion: 'v1',
                columns: reurb_utils_1.DEFAULT_SPREADSHEET_COLUMNS,
            },
            documentNaming: {
                familyFolder: 'familias',
                spreadsheetFolder: 'planilha',
                titlesFolder: 'titulos',
                approvedDocumentsFolder: 'documentos_aprovados',
                requiredDocumentTypes: [],
            },
            validationRules: {
                blockOnPendingDocumentIssues: true,
                requireAptaStatusForExports: false,
                requireAptaStatusForCartorioPackage: true,
                failOnMissingRequiredFields: true,
            },
        });
    }
    normalizeColumns(config) {
        const configured = (config.spreadsheet?.columns ?? []).filter((item) => item.key && item.label);
        return configured.length > 0 ? configured : reurb_utils_1.DEFAULT_SPREADSHEET_COLUMNS;
    }
    familyRowsForExport(families) {
        return families.map((family) => ({
            id: String(family.id ?? ''),
            familyCode: family.familyCode,
            nucleus: family.nucleus,
            responsibleName: family.responsibleName,
            cpf: family.cpf,
            address: family.address,
            membersCount: family.membersCount,
            monthlyIncome: family.monthlyIncome,
            status: family.status,
            data: family.data ?? {},
        }));
    }
    async validateAndAudit(params) {
        const [config, families, pendencies] = await Promise.all([
            this.loadConfig(params.tenantId),
            this.repository.listFamilies(params.tenantId, params.projectId),
            this.repository.listPendencies(params.tenantId, params.projectId),
        ]);
        const validation = this.validationService.validateBeforeDeliverable({
            config,
            families,
            pendencies,
            action: params.action,
        });
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(params.tenantId),
            projectId: (0, object_id_1.asObjectId)(params.projectId),
            action: params.action,
            success: validation.ok,
            errors: validation.errors,
            details: {
                families: families.length,
                pendencies: pendencies.length,
            },
            actorId: params.actorId ? (0, object_id_1.asObjectId)(params.actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        if (!validation.ok) {
            throw new common_1.UnprocessableEntityException({
                code: 'REURB_VALIDATION_FAILED',
                errors: validation.errors,
            });
        }
        return { config, families };
    }
    async getTenantConfig(tenantId) {
        return this.loadConfig(tenantId);
    }
    async upsertTenantConfig(tenantId, dto, actorId) {
        const current = await this.loadConfig(tenantId);
        return this.repository.upsertTenantConfig(tenantId, {
            reurbEnabled: dto.reurbEnabled ?? current.reurbEnabled,
            requiredFamilyFields: dto.requiredFamilyFields ?? current.requiredFamilyFields,
            spreadsheet: {
                templateVersion: dto.spreadsheet?.templateVersion ?? current.spreadsheet?.templateVersion ?? 'v1',
                columns: dto.spreadsheet?.columns ?? current.spreadsheet?.columns ?? reurb_utils_1.DEFAULT_SPREADSHEET_COLUMNS,
            },
            documentNaming: {
                familyFolder: dto.documentNaming?.familyFolder ?? current.documentNaming?.familyFolder ?? 'familias',
                spreadsheetFolder: dto.documentNaming?.spreadsheetFolder ?? current.documentNaming?.spreadsheetFolder ?? 'planilha',
                titlesFolder: dto.documentNaming?.titlesFolder ?? current.documentNaming?.titlesFolder ?? 'titulos',
                approvedDocumentsFolder: dto.documentNaming?.approvedDocumentsFolder ??
                    current.documentNaming?.approvedDocumentsFolder ??
                    'documentos_aprovados',
                requiredDocumentTypes: dto.documentNaming?.requiredDocumentTypes ?? current.documentNaming?.requiredDocumentTypes ?? [],
            },
            validationRules: {
                blockOnPendingDocumentIssues: dto.validationRules?.blockOnPendingDocumentIssues ??
                    current.validationRules?.blockOnPendingDocumentIssues ??
                    true,
                requireAptaStatusForExports: dto.validationRules?.requireAptaStatusForExports ??
                    current.validationRules?.requireAptaStatusForExports ??
                    false,
                requireAptaStatusForCartorioPackage: dto.validationRules?.requireAptaStatusForCartorioPackage ??
                    current.validationRules?.requireAptaStatusForCartorioPackage ??
                    true,
                failOnMissingRequiredFields: dto.validationRules?.failOnMissingRequiredFields ??
                    current.validationRules?.failOnMissingRequiredFields ??
                    true,
            },
            updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
    }
    async createFamily(tenantId, dto, actorId) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        if (!dto.familyCode?.trim())
            throw new common_1.BadRequestException('familyCode obrigatorio');
        return this.repository.createFamily({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            familyCode: dto.familyCode.trim(),
            nucleus: dto.nucleus.trim(),
            responsibleName: dto.responsibleName.trim(),
            cpf: dto.cpf?.trim(),
            address: dto.address?.trim(),
            membersCount: dto.membersCount ?? 1,
            monthlyIncome: dto.monthlyIncome,
            status: dto.status ?? 'PENDENTE',
            data: dto.data ?? {},
            documents: [],
            createdBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
    }
    async listFamilies(tenantId, projectId, filters) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        return this.repository.listFamilies(tenantId, resolved, filters);
    }
    async updateFamily(tenantId, familyId, dto, projectId, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const updated = await this.repository.updateFamily(tenantId, resolved, familyId, {
            nucleus: dto.nucleus,
            responsibleName: dto.responsibleName,
            cpf: dto.cpf,
            address: dto.address,
            membersCount: dto.membersCount,
            monthlyIncome: dto.monthlyIncome,
            status: dto.status,
            data: dto.data,
            updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        if (!updated)
            throw new common_1.NotFoundException('Familia nao encontrada');
        return updated;
    }
    async exportFamiliesCsv(tenantId, projectId, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'EXPORT_BANCO_TABULADO',
        });
        const columns = this.normalizeColumns(config);
        const rows = this.familyRowsForExport(families);
        const csv = (0, reurb_utils_1.toCsv)(columns, rows);
        return this.persistDeliverable({
            tenantId,
            projectId: resolved,
            actorId,
            kind: 'BANCO_TABULADO_CSV',
            fileNameBase: 'banco_tabulado_familias',
            extension: 'csv',
            payload: Buffer.from(csv, 'utf-8'),
            metadata: {
                rows: rows.length,
                columns: columns.map((col) => col.key),
            },
        });
    }
    async exportFamiliesXlsx(tenantId, projectId, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'EXPORT_BANCO_TABULADO',
        });
        const columns = this.normalizeColumns(config);
        const rows = this.familyRowsForExport(families);
        const xlsx = await (0, reurb_utils_1.toXlsx)(columns, rows);
        return this.persistDeliverable({
            tenantId,
            projectId: resolved,
            actorId,
            kind: 'BANCO_TABULADO_XLSX',
            fileNameBase: 'banco_tabulado_familias',
            extension: 'xlsx',
            payload: xlsx,
            metadata: {
                rows: rows.length,
                columns: columns.map((col) => col.key),
            },
        });
    }
    async generatePlanilhaSintese(tenantId, projectId, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'GENERATE_PLANILHA',
        });
        const columns = this.normalizeColumns(config);
        const rows = this.familyRowsForExport(families);
        const xlsx = await (0, reurb_utils_1.toXlsx)(columns, rows);
        return this.persistDeliverable({
            tenantId,
            projectId: resolved,
            actorId,
            kind: 'PLANILHA_SINTESE',
            fileNameBase: 'planilha_sintese',
            extension: 'xlsx',
            payload: xlsx,
            metadata: {
                templateVersion: config.spreadsheet?.templateVersion ?? 'v1',
                rows: rows.length,
                generatedBy: actorId ?? null,
            },
        });
    }
    async createPendency(tenantId, dto, actorId) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        if (dto.familyId) {
            const family = await this.repository.findFamilyById(tenantId, projectId, dto.familyId);
            if (!family)
                throw new common_1.NotFoundException('Familia nao encontrada para vincular pendencia');
        }
        const created = await this.repository.createPendency({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            familyId: dto.familyId ? (0, object_id_1.asObjectId)(dto.familyId) : undefined,
            nucleus: dto.nucleus,
            documentType: dto.documentType,
            missingDocument: dto.missingDocument,
            dueDate: dto.dueDate,
            status: dto.status ?? 'ABERTA',
            observation: dto.observation,
            responsible: dto.responsible,
            statusHistory: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    nextStatus: dto.status ?? 'ABERTA',
                    observation: dto.observation,
                    actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
                    at: new Date().toISOString(),
                },
            ],
            updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        this.pendencyEvents.emit('updated', {
            tenantId,
            projectId,
            pendencyId: String(created.id ?? ''),
            action: 'CREATE',
            at: new Date().toISOString(),
        });
        return created;
    }
    async listPendencies(tenantId, projectId, filters) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        return this.repository.listPendencies(tenantId, resolved, filters);
    }
    async updatePendencyStatus(tenantId, pendencyId, dto, projectId, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const existing = await this.repository.findPendencyById(tenantId, resolved, pendencyId);
        if (!existing)
            throw new common_1.NotFoundException('Pendencia nao encontrada');
        const updated = await this.repository.updatePendencyStatus(tenantId, resolved, pendencyId, {
            status: dto.status,
            observation: dto.observation,
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            statusHistoryEntry: {
                id: (0, crypto_1.randomUUID)(),
                previousStatus: existing.status,
                nextStatus: dto.status,
                observation: dto.observation,
                actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
                at: new Date().toISOString(),
            },
        });
        this.pendencyEvents.emit('updated', {
            tenantId,
            projectId: resolved,
            pendencyId,
            action: 'STATUS_CHANGE',
            at: new Date().toISOString(),
            status: dto.status,
        });
        return updated;
    }
    async requestDocumentUpload(tenantId, dto) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        const family = await this.repository.findFamilyById(tenantId, projectId, dto.familyId);
        if (!family)
            throw new common_1.NotFoundException('Familia nao encontrada');
        const key = [
            'tenants',
            tenantId,
            'reurb',
            projectId,
            'familias',
            dto.familyId,
            dto.documentType,
            `${Date.now()}-${this.sanitizeName(dto.fileName)}`,
        ].join('/');
        return this.storage.createPresignedUpload({
            key,
            contentType: dto.mimeType ?? 'application/octet-stream',
        });
    }
    async completeDocumentUpload(tenantId, dto, actorId) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        const family = await this.repository.findFamilyById(tenantId, projectId, dto.familyId);
        if (!family)
            throw new common_1.NotFoundException('Familia nao encontrada');
        const currentVersion = family.documents
            ?.filter((doc) => doc.documentType === dto.documentType)
            .reduce((max, item) => Math.max(max, item.version), 0) ?? 0;
        family.documents.push({
            id: (0, crypto_1.randomUUID)(),
            documentType: dto.documentType,
            name: dto.fileName,
            key: dto.key,
            version: currentVersion + 1,
            status: dto.status ?? 'PENDENTE',
            metadata: dto.metadata ?? {},
            uploadedAt: new Date().toISOString(),
            uploadedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        family.updatedBy = actorId ? (0, object_id_1.asObjectId)(actorId) : family.updatedBy;
        await family.save();
        return family;
    }
    async generateCartorioPackage(tenantId, projectId, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'GENERATE_CARTORIO_PACKAGE',
        });
        const columns = this.normalizeColumns(config);
        const rows = this.familyRowsForExport(families);
        const spreadsheetBuffer = await (0, reurb_utils_1.toXlsx)(columns, rows);
        const approvedDocuments = await Promise.all(families
            .flatMap((family) => (family.documents ?? [])
            .filter((doc) => doc.status === 'APROVADO')
            .map((doc) => ({
            key: doc.key,
            fileName: doc.name,
            nucleus: family.nucleus,
        })))
            .map(async (doc) => {
            try {
                const blob = await this.storage.getObjectBuffer(doc.key);
                return {
                    fileName: doc.fileName,
                    content: blob.buffer,
                    nucleus: doc.nucleus,
                };
            }
            catch {
                return {
                    fileName: `${doc.fileName}.missing.txt`,
                    content: Buffer.from(`Arquivo ausente no storage: ${doc.key}`, 'utf-8'),
                    nucleus: doc.nucleus,
                };
            }
        }));
        const zipBuffer = await (0, reurb_utils_1.buildCartorioZip)({
            naming: {
                familyFolder: config.documentNaming?.familyFolder ?? 'familias',
                spreadsheetFolder: config.documentNaming?.spreadsheetFolder ?? 'planilha',
                titlesFolder: config.documentNaming?.titlesFolder ?? 'titulos',
                approvedDocumentsFolder: config.documentNaming?.approvedDocumentsFolder ?? 'documentos_aprovados',
            },
            spreadsheetFileName: 'planilha_sintese.xlsx',
            spreadsheetBuffer,
            familyRows: rows,
            approvedDocuments,
        });
        return this.persistDeliverable({
            tenantId,
            projectId: resolved,
            actorId,
            kind: 'PACOTE_CARTORIO_ZIP',
            fileNameBase: 'pacote_cartorio',
            extension: 'zip',
            payload: zipBuffer,
            metadata: {
                rows: rows.length,
                approvedDocuments: approvedDocuments.length,
                integrityHash: (0, reurb_utils_1.sha256Hex)(zipBuffer),
            },
        });
    }
    async listDeliverables(tenantId, projectId, kind) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        return this.repository.listDeliverables(tenantId, resolved, kind);
    }
    async getDeliverableDownload(tenantId, deliverableId, projectId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const deliverable = await this.repository.findDeliverableById(tenantId, resolved, deliverableId);
        if (!deliverable)
            throw new common_1.NotFoundException('Entregavel nao encontrado');
        return this.storage.createPresignedDownload({ key: deliverable.key });
    }
    async persistDeliverable(params) {
        const actorObjectId = params.actorId ? (0, object_id_1.asObjectId)(params.actorId) : new mongoose_1.Types.ObjectId();
        const version = await this.repository.nextDeliverableVersion(params.tenantId, params.projectId, params.kind);
        const fileName = `${params.fileNameBase}_v${version}.${params.extension}`;
        const key = [
            'tenants',
            params.tenantId,
            'reurb',
            params.projectId,
            'deliverables',
            params.kind.toLowerCase(),
            fileName,
        ].join('/');
        await this.storage.putObject({
            key,
            content: params.payload,
            contentType: params.extension === 'zip'
                ? 'application/zip'
                : params.extension === 'csv'
                    ? 'text/csv'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const hashSha256 = (0, reurb_utils_1.sha256Hex)(params.payload);
        const deliverable = await this.repository.createDeliverable({
            tenantId: (0, object_id_1.asObjectId)(params.tenantId),
            projectId: (0, object_id_1.asObjectId)(params.projectId),
            kind: params.kind,
            version,
            fileName,
            key,
            hashSha256,
            validationErrors: [],
            metadata: params.metadata,
            generatedBy: actorObjectId,
            generatedAt: new Date().toISOString(),
        });
        return {
            ...deliverable.toObject(),
            hashSha256,
        };
    }
};
exports.ReurbService = ReurbService;
exports.ReurbService = ReurbService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [reurb_repository_1.ReurbRepository,
        projects_service_1.ProjectsService,
        object_storage_service_1.ObjectStorageService,
        reurb_validation_service_1.ReurbValidationService])
], ReurbService);
//# sourceMappingURL=reurb.service.js.map