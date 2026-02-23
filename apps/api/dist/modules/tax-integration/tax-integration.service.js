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
exports.TaxIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const object_id_1 = require("../../common/utils/object-id");
const projects_service_1 = require("../projects/projects.service");
const tax_integration_repository_1 = require("./tax-integration.repository");
let TaxIntegrationService = class TaxIntegrationService {
    constructor(repository, projectsService) {
        this.repository = repository;
        this.projectsService = projectsService;
    }
    async resolveProject(tenantId, projectId) {
        return this.projectsService.resolveProjectId(tenantId, projectId);
    }
    parseCsvRows(csvContent) {
        const lines = csvContent.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        if (lines.length === 0)
            return { headers: [], rows: [] };
        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
            const values = line.split(',').map((v) => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ?? '';
            });
            return row;
        });
        return { headers, rows };
    }
    async executeRestSync(connector) {
        const endpoint = String(connector.config?.endpoint ?? '');
        if (!endpoint) {
            return { status: 'ERRO', processed: 0, errors: 1, message: 'Endpoint REST nao configurado.' };
        }
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: connector.config?.token
                    ? { Authorization: `Bearer ${String(connector.config.token)}` }
                    : undefined,
            });
            if (!response.ok) {
                return {
                    status: 'ERRO',
                    processed: 0,
                    errors: 1,
                    message: `HTTP ${response.status}`,
                };
            }
            const payload = (await response.json());
            const list = Array.isArray(payload)
                ? payload
                : payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)
                    ? (payload.data ?? [])
                    : [];
            return {
                status: 'SUCESSO',
                processed: list.length,
                inserted: list.length,
                updated: 0,
                errors: 0,
                message: 'Sincronizacao REST concluida.',
            };
        }
        catch {
            return { status: 'ERRO', processed: 0, errors: 1, message: 'Falha de conexao REST.' };
        }
    }
    async executeCsvSync(connector, input) {
        const csvContent = input?.csvContent ?? String(connector.config?.csvSample ?? '');
        if (!csvContent) {
            return { status: 'ERRO', processed: 0, errors: 1, message: 'CSV nao informado.' };
        }
        const parsed = this.parseCsvRows(csvContent);
        return {
            status: 'SUCESSO',
            processed: parsed.rows.length,
            inserted: parsed.rows.length,
            updated: 0,
            errors: 0,
            message: `CSV processado com ${parsed.rows.length} linhas.`,
        };
    }
    async executeSftpSync(connector) {
        const host = String(connector.config?.host ?? '');
        if (!host) {
            return { status: 'ERRO', processed: 0, errors: 1, message: 'Host SFTP nao configurado.' };
        }
        return {
            status: 'SUCESSO',
            processed: 0,
            inserted: 0,
            updated: 0,
            errors: 0,
            message: 'Conector SFTP em modo stub validado.',
        };
    }
    async executeSyncByMode(mode, connector, input) {
        if (mode === 'REST_JSON')
            return this.executeRestSync(connector);
        if (mode === 'CSV_UPLOAD')
            return this.executeCsvSync(connector, input);
        return this.executeSftpSync(connector);
    }
    async listConnectors(tenantId, projectId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        return this.repository.listConnectors(tenantId, String(resolvedProject));
    }
    async createConnector(tenantId, dto, userId) {
        const resolvedProject = await this.resolveProject(tenantId, dto.projectId);
        return this.repository.createConnector({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProject,
            name: dto.name,
            mode: dto.mode,
            config: dto.config ?? {},
            fieldMapping: dto.fieldMapping ?? {},
            isActive: dto.isActive ?? true,
            createdBy: userId ? (0, object_id_1.asObjectId)(userId) : undefined,
        });
    }
    async updateConnector(tenantId, projectId, connectorId, dto) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const updated = await this.repository.updateConnector(tenantId, String(resolvedProject), connectorId, dto);
        if (!updated)
            throw new common_1.BadRequestException('Conector nao encontrado');
        return updated;
    }
    async testConnection(tenantId, projectId, connectorId, actorId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const connector = await this.repository.findConnectorById(tenantId, String(resolvedProject), connectorId);
        if (!connector)
            throw new common_1.BadRequestException('Conector nao encontrado');
        const result = await this.executeSyncByMode(connector.mode, connector);
        await this.repository.createLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProject,
            connectorId: (0, object_id_1.asObjectId)(connector.id),
            trigger: 'TEST',
            status: result.status,
            summary: {
                processed: result.processed,
                inserted: result.inserted,
                updated: result.updated,
                errors: result.errors,
                message: result.message,
            },
            errorMessage: result.status === 'ERRO' ? result.message : undefined,
            startedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        return result;
    }
    async runSync(tenantId, projectId, connectorId, dto, actorId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        const connector = await this.repository.findConnectorById(tenantId, String(resolvedProject), connectorId);
        if (!connector)
            throw new common_1.BadRequestException('Conector nao encontrado');
        const result = await this.executeSyncByMode(connector.mode, connector, dto);
        await this.repository.createLog({
            tenantId: (0, object_id_1.asObjectId)(tenantId),
            projectId: resolvedProject,
            connectorId: (0, object_id_1.asObjectId)(connector.id),
            trigger: 'MANUAL',
            status: result.status,
            summary: {
                processed: result.processed,
                inserted: result.inserted,
                updated: result.updated,
                errors: result.errors,
                message: result.message,
            },
            errorMessage: result.status === 'ERRO' ? result.message : undefined,
            startedBy: actorId ? (0, object_id_1.asObjectId)(actorId) : undefined,
        });
        if (result.status === 'SUCESSO') {
            await this.repository.updateConnector(tenantId, String(resolvedProject), connectorId, {
                lastSyncAt: new Date(),
            });
        }
        return result;
    }
    async listLogs(tenantId, projectId, connectorId) {
        const resolvedProject = await this.resolveProject(tenantId, projectId);
        return this.repository.listLogs(tenantId, String(resolvedProject), connectorId);
    }
};
exports.TaxIntegrationService = TaxIntegrationService;
exports.TaxIntegrationService = TaxIntegrationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tax_integration_repository_1.TaxIntegrationRepository,
        projects_service_1.ProjectsService])
], TaxIntegrationService);
//# sourceMappingURL=tax-integration.service.js.map