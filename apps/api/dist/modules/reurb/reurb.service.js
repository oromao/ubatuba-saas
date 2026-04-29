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
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const mongoose_1 = require("mongoose");
const object_id_1 = require("../../common/utils/object-id");
const projects_service_1 = require("../projects/projects.service");
const object_storage_service_1 = require("../shared/object-storage.service");
const reurb_repository_1 = require("./reurb.repository");
const reurb_utils_1 = require("./reurb.utils");
const reurb_validation_service_1 = require("./reurb-validation.service");
const nodemailer_1 = require("nodemailer");
let ReurbService = class ReurbService {
    constructor(repository, projectsService, storage, validationService) {
        this.repository = repository;
        this.projectsService = projectsService;
        this.storage = storage;
        this.validationService = validationService;
        this.pendencyEvents = new events_1.EventEmitter();
        this.mailTransport = process.env.SMTP_URL
            ? (0, nodemailer_1.createTransport)(process.env.SMTP_URL)
            : null;
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
                requiredProjectDocumentTypes: [],
                requiredUnitDocumentTypes: [],
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
                purpose: params.purpose ?? 'not_informed',
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
    async auditAccess(params) {
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(params.tenantId),
            projectId: (0, object_id_1.asObjectId)(params.projectId),
            action: params.action,
            success: true,
            errors: [],
            details: {
                purpose: params.purpose ?? 'not_informed',
                ...params.details,
            },
            actorId: params.actorId ? (0, object_id_1.asObjectId)(params.actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
    }
    async getTenantConfig(tenantId) {
        return this.loadConfig(tenantId);
    }
    async createProject(tenantId, dto, actorId) {
        const project = await this.repository.createProject({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            name: dto.name.trim(),
            area: dto.area?.trim(),
            reurbType: dto.reurbType ?? 'REURB-S',
            status: dto.status ?? 'RASCUNHO',
            startDate: dto.startDate,
            endDate: dto.endDate,
            responsibles: dto.responsibles ?? [],
            metadata: dto.metadata ?? {},
            statusHistory: [
                {
                    id: (0, crypto_1.randomUUID)(),
                    nextStatus: dto.status ?? 'RASCUNHO',
                    observation: 'Projeto criado',
                    actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
                    at: new Date().toISOString(),
                },
            ],
            documents: [],
            createdBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(project.id),
            action: 'PROJECT_CREATE',
            success: true,
            errors: [],
            details: { name: project.name, status: project.status },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return project;
    }
    async listProjects(tenantId) {
        return this.repository.listProjects(tenantId);
    }
    async updateProject(tenantId, projectId, dto, actorId) {
        const existing = await this.repository.findProjectById(tenantId, projectId);
        if (!existing)
            throw new common_1.NotFoundException('Projeto nao encontrado');
        const statusHistory = dto.status && dto.status !== existing.status
            ? [
                ...(existing.statusHistory ?? []),
                {
                    id: (0, crypto_1.randomUUID)(),
                    previousStatus: existing.status,
                    nextStatus: dto.status,
                    observation: dto.statusObservation,
                    actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
                    at: new Date().toISOString(),
                },
            ]
            : existing.statusHistory;
        const updated = await this.repository.updateProject(tenantId, projectId, {
            name: dto.name ?? existing.name,
            area: dto.area ?? existing.area,
            reurbType: dto.reurbType ?? existing.reurbType,
            status: dto.status ?? existing.status,
            startDate: dto.startDate ?? existing.startDate,
            endDate: dto.endDate ?? existing.endDate,
            responsibles: dto.responsibles ?? existing.responsibles,
            metadata: dto.metadata ?? existing.metadata,
            statusHistory,
            updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        if (!updated)
            throw new common_1.NotFoundException('Projeto nao encontrado');
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            action: 'PROJECT_UPDATE',
            success: true,
            errors: [],
            details: { status: updated.status },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return updated;
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
                requiredProjectDocumentTypes: dto.documentNaming?.requiredProjectDocumentTypes ??
                    current.documentNaming?.requiredProjectDocumentTypes ??
                    [],
                requiredUnitDocumentTypes: dto.documentNaming?.requiredUnitDocumentTypes ?? current.documentNaming?.requiredUnitDocumentTypes ?? [],
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
        const created = await this.repository.createFamily({
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
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            action: 'FAMILY_CREATE',
            success: true,
            errors: [],
            details: { familyCode: created.familyCode, nucleus: created.nucleus },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return created;
    }
    async importFamiliesCsv(tenantId, dto, actorId) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        const delimiter = dto.delimiter && dto.delimiter.length > 0 ? dto.delimiter : ',';
        const lines = dto.csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length === 0)
            throw new common_1.BadRequestException('CSV vazio');
        const parseLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i += 1) {
                const char = line[i];
                if (char === '"') {
                    const next = line[i + 1];
                    if (next === '"') {
                        current += '"';
                        i += 1;
                    }
                    else {
                        inQuotes = !inQuotes;
                    }
                    continue;
                }
                if (char === delimiter && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                    continue;
                }
                current += char;
            }
            result.push(current.trim());
            return result;
        };
        const header = parseLine(lines[0]).map((col) => col.toLowerCase());
        const idx = (name) => header.indexOf(name.toLowerCase());
        const required = ['familycode', 'nucleus', 'responsiblename'];
        const missing = required.filter((col) => idx(col) === -1);
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`CSV faltando colunas: ${missing.join(', ')}`);
        }
        const errors = [];
        let created = 0;
        for (let i = 1; i < lines.length; i += 1) {
            const row = parseLine(lines[i]);
            const familyCode = row[idx('familycode')] ?? '';
            const nucleus = row[idx('nucleus')] ?? '';
            const responsibleName = row[idx('responsiblename')] ?? '';
            if (!familyCode || !nucleus || !responsibleName) {
                errors.push({ row: i + 1, message: 'Campos obrigatorios faltando', data: row });
                continue;
            }
            try {
                await this.repository.createFamily({
                    tenantId: (0, object_id_1.asObjectId)(tenantId),
                    projectId: (0, object_id_1.asObjectId)(projectId),
                    familyCode: familyCode.trim(),
                    nucleus: nucleus.trim(),
                    responsibleName: responsibleName.trim(),
                    cpf: row[idx('cpf')]?.trim() || undefined,
                    address: row[idx('address')]?.trim() || undefined,
                    membersCount: Number(row[idx('memberscount')] ?? 1) || 1,
                    monthlyIncome: Number(row[idx('monthlyincome')] ?? 0) || undefined,
                    status: row[idx('status')] ?? 'PENDENTE',
                    data: {},
                    documents: [],
                    createdBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
                    updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
                });
                created += 1;
            }
            catch (error) {
                errors.push({ row: i + 1, message: error.message, data: row });
            }
        }
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            action: 'FAMILY_IMPORT_CSV',
            success: errors.length === 0,
            errors: errors.map((err) => ({ code: 'CSV_ROW_ERROR', message: err.message })),
            details: { created, total: lines.length - 1 },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return { total: lines.length - 1, created, errors };
    }
    async listFamilies(tenantId, projectId, filters, params) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const families = await this.repository.listFamilies(tenantId, resolved, filters);
        await this.auditAccess({
            tenantId,
            projectId: resolved,
            actorId: params?.actorId,
            purpose: params?.purpose,
            action: 'ACCESS_FAMILIES_LIST',
            details: {
                count: families.length,
                filters: filters ?? {},
            },
        });
        return families;
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
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(resolved),
            action: 'FAMILY_UPDATE',
            success: true,
            errors: [],
            details: { familyCode: updated.familyCode, nucleus: updated.nucleus },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return updated;
    }
    async exportFamiliesCsv(tenantId, projectId, actorId, purpose) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'EXPORT_BANCO_TABULADO',
            purpose,
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
    async exportFamiliesXlsx(tenantId, projectId, actorId, purpose) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'EXPORT_BANCO_TABULADO',
            purpose,
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
    async generatePlanilhaSintese(tenantId, projectId, actorId, purpose) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'GENERATE_PLANILHA',
            purpose,
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
    async listPendencies(tenantId, projectId, filters, params) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const pendencies = await this.repository.listPendencies(tenantId, resolved, filters);
        await this.auditAccess({
            tenantId,
            projectId: resolved,
            actorId: params?.actorId,
            purpose: params?.purpose,
            action: 'ACCESS_PENDENCIES_LIST',
            details: {
                count: pendencies.length,
                filters: filters ?? {},
            },
        });
        return pendencies;
    }
    async createUnit(tenantId, dto, actorId) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        const created = await this.repository.createUnit({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            code: dto.code.trim(),
            block: dto.block?.trim(),
            lot: dto.lot?.trim(),
            address: dto.address?.trim(),
            area: dto.area,
            geometry: dto.geometry,
            familyIds: (dto.familyIds ?? []).map(object_id_1.asObjectId),
            metadata: dto.metadata ?? {},
            documents: [],
            createdBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            action: 'UNIT_CREATE',
            success: true,
            errors: [],
            details: { code: created.code },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return created;
    }
    async listUnits(tenantId, projectId, filters) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        return this.repository.listUnits(tenantId, resolved, filters);
    }
    async updateUnit(tenantId, unitId, dto, projectId, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const existing = await this.repository.findUnitById(tenantId, resolved, unitId);
        if (!existing)
            throw new common_1.NotFoundException('Unidade nao encontrada');
        const updated = await this.repository.updateUnit(tenantId, resolved, unitId, {
            block: dto.block ?? existing.block,
            lot: dto.lot ?? existing.lot,
            address: dto.address ?? existing.address,
            area: dto.area ?? existing.area,
            geometry: dto.geometry ?? existing.geometry,
            familyIds: dto.familyIds ? dto.familyIds.map(object_id_1.asObjectId) : existing.familyIds,
            metadata: dto.metadata ?? existing.metadata,
            updatedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        if (!updated)
            throw new common_1.NotFoundException('Unidade nao encontrada');
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(resolved),
            action: 'UNIT_UPDATE',
            success: true,
            errors: [],
            details: { code: updated.code },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return updated;
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
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            action: 'FAMILY_DOCUMENT_UPLOAD',
            success: true,
            errors: [],
            details: { familyId: dto.familyId, documentType: dto.documentType, status: dto.status ?? 'PENDENTE' },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return family;
    }
    async requestProjectDocumentUpload(tenantId, dto) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        const project = await this.repository.findProjectById(tenantId, projectId);
        if (!project)
            throw new common_1.NotFoundException('Projeto nao encontrado');
        const key = [
            'tenants',
            tenantId,
            'reurb',
            projectId,
            'project_documents',
            dto.documentType,
            `${Date.now()}-${this.sanitizeName(dto.fileName)}`,
        ].join('/');
        return this.storage.createPresignedUpload({
            key,
            contentType: dto.mimeType ?? 'application/octet-stream',
        });
    }
    async completeProjectDocumentUpload(tenantId, dto, actorId) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        const project = await this.repository.findProjectById(tenantId, projectId);
        if (!project)
            throw new common_1.NotFoundException('Projeto nao encontrado');
        const currentVersion = project.documents
            ?.filter((doc) => doc.documentType === dto.documentType)
            .reduce((max, item) => Math.max(max, item.version), 0) ?? 0;
        project.documents.push({
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
        project.updatedBy = actorId ? (0, object_id_1.asObjectId)(actorId) : project.updatedBy;
        await project.save();
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            action: 'PROJECT_DOCUMENT_UPLOAD',
            success: true,
            errors: [],
            details: { documentType: dto.documentType, status: dto.status ?? 'PENDENTE' },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return project;
    }
    async requestUnitDocumentUpload(tenantId, dto) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        const unit = await this.repository.findUnitById(tenantId, projectId, dto.unitId);
        if (!unit)
            throw new common_1.NotFoundException('Unidade nao encontrada');
        const key = [
            'tenants',
            tenantId,
            'reurb',
            projectId,
            'units',
            dto.unitId,
            dto.documentType,
            `${Date.now()}-${this.sanitizeName(dto.fileName)}`,
        ].join('/');
        return this.storage.createPresignedUpload({
            key,
            contentType: dto.mimeType ?? 'application/octet-stream',
        });
    }
    async completeUnitDocumentUpload(tenantId, dto, actorId) {
        const projectId = await this.resolveProjectId(tenantId, dto.projectId);
        const unit = await this.repository.findUnitById(tenantId, projectId, dto.unitId);
        if (!unit)
            throw new common_1.NotFoundException('Unidade nao encontrada');
        const currentVersion = unit.documents
            ?.filter((doc) => doc.documentType === dto.documentType)
            .reduce((max, item) => Math.max(max, item.version), 0) ?? 0;
        unit.documents.push({
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
        unit.updatedBy = actorId ? (0, object_id_1.asObjectId)(actorId) : unit.updatedBy;
        await unit.save();
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(projectId),
            action: 'UNIT_DOCUMENT_UPLOAD',
            success: true,
            errors: [],
            details: { unitId: dto.unitId, documentType: dto.documentType, status: dto.status ?? 'PENDENTE' },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return unit;
    }
    async listNotificationTemplates(tenantId, projectId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        return this.repository.listNotificationTemplates(tenantId, resolved);
    }
    async createNotificationTemplate(tenantId, dto) {
        const resolved = await this.resolveProjectId(tenantId, dto.projectId);
        const variables = Array.from(new Set((dto.body.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) ?? []).map((item) => item.replace(/[{} ]/g, ''))));
        const version = await this.repository.nextNotificationTemplateVersion(tenantId, resolved, dto.name);
        return this.repository.createNotificationTemplate({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(resolved),
            name: dto.name,
            subject: dto.subject,
            body: dto.body,
            variables,
            version,
            isActive: true,
        });
    }
    async updateNotificationTemplate(tenantId, projectId, templateId, dto) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const updated = await this.repository.updateNotificationTemplate(tenantId, resolved, templateId, dto);
        if (!updated)
            throw new common_1.BadRequestException('Template nao encontrado');
        return updated;
    }
    async listNotifications(tenantId, projectId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        return this.repository.listNotifications(tenantId, resolved);
    }
    async sendNotificationEmail(params) {
        const resolved = await this.resolveProjectId(params.tenantId, params.projectId);
        const template = await this.repository.findNotificationTemplateById(params.tenantId, resolved, params.templateId);
        if (!template)
            throw new common_1.BadRequestException('Template nao encontrado');
        const body = template.body.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
            const value = params.variables?.[key];
            return value !== undefined ? String(value) : '';
        });
        const subject = template.subject.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
            const value = params.variables?.[key];
            return value !== undefined ? String(value) : '';
        });
        let status = 'QUEUED';
        let error;
        if (this.mailTransport) {
            try {
                await this.mailTransport.sendMail({
                    from: process.env.SMTP_FROM ?? 'no-reply@flydea.local',
                    to: params.to,
                    subject,
                    text: body,
                });
                status = 'SENT';
            }
            catch (err) {
                status = 'FAILED';
                error = err.message;
            }
        }
        const notification = await this.repository.createNotification({
            tenantId: (0, object_id_1.asObjectId)(params.tenantId),
            projectId: (0, object_id_1.asObjectId)(resolved),
            templateId: (0, object_id_1.asObjectId)(template.id),
            templateName: template.name,
            templateVersion: template.version,
            channel: 'EMAIL',
            to: params.to,
            status,
            payload: params.variables ?? {},
            evidenceKeys: [],
            error,
            sentAt: status === 'SENT' ? new Date().toISOString() : undefined,
            createdBy: params.actorId ? (0, object_id_1.asObjectId)(params.actorId) : undefined,
        });
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(params.tenantId),
            projectId: (0, object_id_1.asObjectId)(resolved),
            action: 'NOTIFICATION_EMAIL_SEND',
            success: status === 'SENT',
            errors: error ? [{ code: 'EMAIL_SEND_FAILED', message: error }] : [],
            details: { to: params.to, template: template.name },
            actorId: params.actorId ? (0, object_id_1.asObjectId)(params.actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return notification;
    }
    async attachNotificationEvidence(tenantId, projectId, notificationId, key, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const notification = await this.repository.findNotificationById(tenantId, resolved, notificationId);
        if (!notification)
            throw new common_1.NotFoundException('Notificacao nao encontrada');
        const updated = await this.repository.updateNotification(tenantId, resolved, notificationId, {
            evidenceKeys: Array.from(new Set([...(notification.evidenceKeys ?? []), key])),
        });
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(resolved),
            action: 'NOTIFICATION_EVIDENCE_ATTACH',
            success: true,
            errors: [],
            details: { notificationId, key },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return updated;
    }
    async requestNotificationEvidenceUpload(tenantId, projectId, fileName, mimeType) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const key = [
            'tenants',
            tenantId,
            'reurb',
            resolved,
            'notification_evidence',
            `${Date.now()}-${this.sanitizeName(fileName ?? 'evidencia')}`,
        ].join('/');
        return this.storage.createPresignedUpload({
            key,
            contentType: mimeType ?? 'application/octet-stream',
        });
    }
    async pingIntegration(tenantId, projectId, payload, actorId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const url = process.env.INTEGRATION_HTTP_URL ?? 'https://httpbin.org/post';
        const method = (process.env.INTEGRATION_HTTP_METHOD ?? 'POST').toUpperCase();
        const startedAt = Date.now();
        let status = 'FAILED';
        let responseBody = null;
        let error;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'content-type': 'application/json' },
                body: method === 'GET'
                    ? undefined
                    : JSON.stringify({
                        tenantId,
                        projectId: resolved,
                        payload,
                        sentAt: new Date().toISOString(),
                    }),
            });
            status = response.ok ? 'SENT' : 'FAILED';
            responseBody = await response.json().catch(() => ({ ok: response.ok }));
            if (!response.ok) {
                error = `HTTP ${response.status}`;
            }
        }
        catch (err) {
            status = 'FAILED';
            error = err.message;
        }
        await this.repository.createAuditLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: (0, object_id_1.asObjectId)(resolved),
            action: 'INTEGRATION_HTTP_PING',
            success: status === 'SENT',
            errors: error ? [{ code: 'INTEGRATION_HTTP_FAILED', message: error }] : [],
            details: { url, durationMs: Date.now() - startedAt, payload },
            actorId: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
            happenedAt: new Date().toISOString(),
        });
        return {
            status,
            url,
            response: responseBody,
            error,
        };
    }
    async getDossierSummary(tenantId, projectId) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const [config, project, families, units] = await Promise.all([
            this.loadConfig(tenantId),
            this.repository.findProjectById(tenantId, resolved),
            this.repository.listFamilies(tenantId, resolved),
            this.repository.listUnits(tenantId, resolved),
        ]);
        if (!project)
            throw new common_1.NotFoundException('Projeto nao encontrado');
        const requiredFamily = config.documentNaming?.requiredDocumentTypes ?? [];
        const requiredProject = config.documentNaming?.requiredProjectDocumentTypes ?? [];
        const requiredUnit = config.documentNaming?.requiredUnitDocumentTypes ?? [];
        const projectMissing = requiredProject.filter((doc) => !project.documents?.some((item) => item.documentType === doc && item.status === 'APROVADO'));
        const familiesMissing = families.map((family) => {
            const missing = requiredFamily.filter((doc) => !family.documents?.some((item) => item.documentType === doc && item.status === 'APROVADO'));
            return { familyId: String(family.id ?? ''), missing };
        });
        const unitsMissing = units.map((unit) => {
            const missing = requiredUnit.filter((doc) => !unit.documents?.some((item) => item.documentType === doc && item.status === 'APROVADO'));
            return { unitId: String(unit.id ?? ''), missing };
        });
        return {
            project: {
                id: String(project.id ?? ''),
                name: project.name,
                status: project.status,
                missingDocuments: projectMissing,
            },
            families: familiesMissing,
            units: unitsMissing,
        };
    }
    async generateCartorioPackage(tenantId, projectId, actorId, purpose) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'GENERATE_CARTORIO_PACKAGE',
            purpose,
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
        const extraFiles = [];
        const reportPath = process.env.REURB_ADERENCIA_PDF_PATH ??
            node_path_1.default.resolve(process.cwd(), 'docs', 'ubatuba-ce24-2025-aderencia-mvp.pdf');
        try {
            const reportContent = await promises_1.default.readFile(reportPath);
            extraFiles.push({ path: 'relatorios/aderencia-mvp.pdf', content: reportContent });
        }
        catch {
        }
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
            extraFiles,
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
    async exportFamiliesJson(tenantId, projectId, actorId, purpose) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const { config, families } = await this.validateAndAudit({
            tenantId,
            projectId: resolved,
            actorId,
            action: 'EXPORT_BANCO_TABULADO',
            purpose,
        });
        const columns = this.normalizeColumns(config);
        const rows = this.familyRowsForExport(families);
        const payload = Buffer.from(JSON.stringify({ columns, rows }, null, 2), 'utf-8');
        return this.persistDeliverable({
            tenantId,
            projectId: resolved,
            actorId,
            kind: 'BANCO_TABULADO_JSON',
            fileNameBase: 'banco_tabulado_familias',
            extension: 'json',
            payload,
            metadata: {
                rows: rows.length,
                columns: columns.map((col) => col.key),
            },
        });
    }
    async listDeliverables(tenantId, projectId, kind, params) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const deliverables = await this.repository.listDeliverables(tenantId, resolved, kind);
        await this.auditAccess({
            tenantId,
            projectId: resolved,
            actorId: params?.actorId,
            purpose: params?.purpose,
            action: 'ACCESS_DELIVERABLES_LIST',
            details: {
                count: deliverables.length,
                kind: kind ?? 'all',
            },
        });
        return deliverables;
    }
    async getDeliverableDownload(tenantId, deliverableId, projectId, params) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        const deliverable = await this.repository.findDeliverableById(tenantId, resolved, deliverableId);
        if (!deliverable)
            throw new common_1.NotFoundException('Entregavel nao encontrado');
        const signed = await this.storage.createPresignedDownload({ key: deliverable.key });
        await this.auditAccess({
            tenantId,
            projectId: resolved,
            actorId: params?.actorId,
            purpose: params?.purpose,
            action: 'DOWNLOAD_DELIVERABLE',
            details: {
                deliverableId: String(deliverable._id),
                kind: deliverable.kind,
                fileName: deliverable.fileName,
            },
        });
        return signed;
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
                    : params.extension === 'json'
                        ? 'application/json'
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
    async listAuditLogs(tenantId, projectId, action, limit) {
        const resolved = await this.resolveProjectId(tenantId, projectId);
        return this.repository.listAuditLogs(tenantId, resolved, { action, limit });
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