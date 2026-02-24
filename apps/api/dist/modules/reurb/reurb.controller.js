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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReurbController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const reurb_dto_1 = require("./dto/reurb.dto");
const reurb_service_1 = require("./reurb.service");
let ReurbController = class ReurbController {
    constructor(service) {
        this.service = service;
    }
    getTenantConfig(req) {
        return this.service.getTenantConfig(req.tenantId);
    }
    upsertTenantConfig(req, dto) {
        return this.service.upsertTenantConfig(req.tenantId, dto, req.user?.sub);
    }
    createProject(req, dto) {
        return this.service.createProject(req.tenantId, dto, req.user?.sub);
    }
    listProjects(req) {
        return this.service.listProjects(req.tenantId);
    }
    updateProject(req, id, dto) {
        return this.service.updateProject(req.tenantId, id, dto, req.user?.sub);
    }
    createFamily(req, dto) {
        return this.service.createFamily(req.tenantId, dto, req.user?.sub);
    }
    importFamilies(req, dto) {
        return this.service.importFamiliesCsv(req.tenantId, dto, req.user?.sub);
    }
    listFamilies(req, purpose, projectId, status, nucleus, q) {
        return this.service.listFamilies(req.tenantId, projectId, { status, nucleus, q }, { actorId: req.user?.sub, purpose });
    }
    updateFamily(req, id, projectId, dto) {
        return this.service.updateFamily(req.tenantId, id, dto, projectId, req.user?.sub);
    }
    exportFamiliesCsv(req, purpose, dto) {
        return this.service.exportFamiliesCsv(req.tenantId, dto.projectId, req.user?.sub, purpose);
    }
    exportFamiliesXlsx(req, purpose, dto) {
        return this.service.exportFamiliesXlsx(req.tenantId, dto.projectId, req.user?.sub, purpose);
    }
    exportFamiliesJson(req, purpose, dto) {
        return this.service.exportFamiliesJson(req.tenantId, dto.projectId, req.user?.sub, purpose);
    }
    generatePlanilha(req, purpose, dto) {
        return this.service.generatePlanilhaSintese(req.tenantId, dto.projectId, req.user?.sub, purpose);
    }
    createPendency(req, dto) {
        return this.service.createPendency(req.tenantId, dto, req.user?.sub);
    }
    createUnit(req, dto) {
        return this.service.createUnit(req.tenantId, dto, req.user?.sub);
    }
    listUnits(req, projectId, code, block, lot) {
        return this.service.listUnits(req.tenantId, projectId, { code, block, lot });
    }
    updateUnit(req, id, projectId, dto) {
        return this.service.updateUnit(req.tenantId, id, dto, projectId, req.user?.sub);
    }
    listPendencies(req, purpose, projectId, status, nucleus, familyId) {
        return this.service.listPendencies(req.tenantId, projectId, { status, nucleus, familyId }, { actorId: req.user?.sub, purpose });
    }
    updatePendencyStatus(req, id, projectId, dto) {
        return this.service.updatePendencyStatus(req.tenantId, id, dto, projectId, req.user?.sub);
    }
    pendenciesStream(req) {
        return (0, rxjs_1.fromEventPattern)((handler) => this.service.getPendencyEvents().on('updated', handler), (handler) => this.service.getPendencyEvents().off('updated', handler)).pipe((0, rxjs_1.map)((event) => {
            if (event.tenantId !== req.tenantId) {
                return { type: 'noop', data: { ignored: true } };
            }
            return {
                type: 'pendency-updated',
                data: event,
            };
        }));
    }
    requestDocumentUpload(req, dto) {
        return this.service.requestDocumentUpload(req.tenantId, dto);
    }
    completeDocumentUpload(req, dto) {
        return this.service.completeDocumentUpload(req.tenantId, dto, req.user?.sub);
    }
    requestProjectDocumentUpload(req, dto) {
        return this.service.requestProjectDocumentUpload(req.tenantId, dto);
    }
    completeProjectDocumentUpload(req, dto) {
        return this.service.completeProjectDocumentUpload(req.tenantId, dto, req.user?.sub);
    }
    requestUnitDocumentUpload(req, dto) {
        return this.service.requestUnitDocumentUpload(req.tenantId, dto);
    }
    completeUnitDocumentUpload(req, dto) {
        return this.service.completeUnitDocumentUpload(req.tenantId, dto, req.user?.sub);
    }
    getDossierSummary(req, projectId) {
        return this.service.getDossierSummary(req.tenantId, projectId);
    }
    listNotificationTemplates(req, projectId) {
        return this.service.listNotificationTemplates(req.tenantId, projectId);
    }
    createNotificationTemplate(req, dto) {
        return this.service.createNotificationTemplate(req.tenantId, dto);
    }
    updateNotificationTemplate(req, id, projectId, dto) {
        return this.service.updateNotificationTemplate(req.tenantId, projectId, id, dto);
    }
    listNotifications(req, projectId) {
        return this.service.listNotifications(req.tenantId, projectId);
    }
    sendNotificationEmail(req, dto) {
        return this.service.sendNotificationEmail({
            tenantId: req.tenantId,
            projectId: dto.projectId,
            templateId: dto.templateId,
            to: dto.to,
            variables: dto.variables,
            actorId: req.user?.sub,
        });
    }
    requestNotificationEvidenceUpload(req, dto) {
        return this.service.requestNotificationEvidenceUpload(req.tenantId, dto.projectId, dto.fileName, dto.mimeType);
    }
    attachNotificationEvidence(req, id, dto) {
        return this.service.attachNotificationEvidence(req.tenantId, dto.projectId, id, dto.key, req.user?.sub);
    }
    pingIntegration(req, dto) {
        return this.service.pingIntegration(req.tenantId, dto.projectId, dto.payload ?? {}, req.user?.sub);
    }
    generateCartorioPackage(req, purpose, dto) {
        return this.service.generateCartorioPackage(req.tenantId, dto.projectId, req.user?.sub, purpose);
    }
    listDeliverables(req, purpose, projectId, kind) {
        return this.service.listDeliverables(req.tenantId, projectId, kind, {
            actorId: req.user?.sub,
            purpose,
        });
    }
    getDeliverableDownload(req, purpose, id, projectId) {
        return this.service.getDeliverableDownload(req.tenantId, id, projectId, {
            actorId: req.user?.sub,
            purpose,
        });
    }
    listAuditLogs(req, projectId, action, limit) {
        const parsedLimit = limit ? Math.min(Number(limit), 500) : undefined;
        return this.service.listAuditLogs(req.tenantId, projectId, action, parsedLimit);
    }
};
exports.ReurbController = ReurbController;
__decorate([
    (0, common_1.Get)('tenant-config'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "getTenantConfig", null);
__decorate([
    (0, common_1.Put)('tenant-config'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.UpsertTenantConfigDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "upsertTenantConfig", null);
__decorate([
    (0, common_1.Post)('projects'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.CreateReurbProjectDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)('projects'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "listProjects", null);
__decorate([
    (0, common_1.Patch)('projects/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reurb_dto_1.UpdateReurbProjectDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "updateProject", null);
__decorate([
    (0, common_1.Post)('families'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.CreateReurbFamilyDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "createFamily", null);
__decorate([
    (0, common_1.Post)('families/import.csv'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.ImportFamiliesCsvDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "importFamilies", null);
__decorate([
    (0, common_1.Get)('families'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('nucleus')),
    __param(5, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "listFamilies", null);
__decorate([
    (0, common_1.Patch)('families/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, reurb_dto_1.UpdateReurbFamilyDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "updateFamily", null);
__decorate([
    (0, common_1.Post)('families/export.csv'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, reurb_dto_1.DeliverableCommandDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "exportFamiliesCsv", null);
__decorate([
    (0, common_1.Post)('families/export.xlsx'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, reurb_dto_1.DeliverableCommandDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "exportFamiliesXlsx", null);
__decorate([
    (0, common_1.Post)('families/export.json'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, reurb_dto_1.DeliverableCommandDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "exportFamiliesJson", null);
__decorate([
    (0, common_1.Post)('planilha-sintese/generate'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, reurb_dto_1.DeliverableCommandDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "generatePlanilha", null);
__decorate([
    (0, common_1.Post)('pendencies'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.CreatePendencyDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "createPendency", null);
__decorate([
    (0, common_1.Post)('units'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.CreateReurbUnitDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "createUnit", null);
__decorate([
    (0, common_1.Get)('units'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('code')),
    __param(3, (0, common_1.Query)('block')),
    __param(4, (0, common_1.Query)('lot')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "listUnits", null);
__decorate([
    (0, common_1.Patch)('units/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, reurb_dto_1.UpdateReurbUnitDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "updateUnit", null);
__decorate([
    (0, common_1.Get)('pendencies'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('nucleus')),
    __param(5, (0, common_1.Query)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "listPendencies", null);
__decorate([
    (0, common_1.Patch)('pendencies/:id/status'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, reurb_dto_1.UpdatePendencyStatusDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "updatePendencyStatus", null);
__decorate([
    (0, common_1.Sse)('pendencies/stream'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], ReurbController.prototype, "pendenciesStream", null);
__decorate([
    (0, common_1.Post)('documents/presign-upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.RequestDocumentUploadDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "requestDocumentUpload", null);
__decorate([
    (0, common_1.Post)('documents/complete-upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.CompleteDocumentUploadDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "completeDocumentUpload", null);
__decorate([
    (0, common_1.Post)('project-documents/presign-upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.RequestProjectDocumentUploadDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "requestProjectDocumentUpload", null);
__decorate([
    (0, common_1.Post)('project-documents/complete-upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.CompleteProjectDocumentUploadDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "completeProjectDocumentUpload", null);
__decorate([
    (0, common_1.Post)('unit-documents/presign-upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.RequestUnitDocumentUploadDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "requestUnitDocumentUpload", null);
__decorate([
    (0, common_1.Post)('unit-documents/complete-upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.CompleteUnitDocumentUploadDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "completeUnitDocumentUpload", null);
__decorate([
    (0, common_1.Get)('dossier'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "getDossierSummary", null);
__decorate([
    (0, common_1.Get)('notification-templates'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "listNotificationTemplates", null);
__decorate([
    (0, common_1.Post)('notification-templates'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.CreateNotificationTemplateDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "createNotificationTemplate", null);
__decorate([
    (0, common_1.Patch)('notification-templates/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, reurb_dto_1.UpdateNotificationTemplateDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "updateNotificationTemplate", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR', 'LEITOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "listNotifications", null);
__decorate([
    (0, common_1.Post)('notifications/send-email'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.SendNotificationEmailDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "sendNotificationEmail", null);
__decorate([
    (0, common_1.Post)('notifications/evidence/presign-upload'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.RequestNotificationEvidenceUploadDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "requestNotificationEvidenceUpload", null);
__decorate([
    (0, common_1.Post)('notifications/:id/evidence'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reurb_dto_1.AttachNotificationEvidenceDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "attachNotificationEvidence", null);
__decorate([
    (0, common_1.Post)('integrations/ping'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reurb_dto_1.IntegrationPingDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "pingIntegration", null);
__decorate([
    (0, common_1.Post)('cartorio/package'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, reurb_dto_1.DeliverableCommandDto]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "generateCartorioPackage", null);
__decorate([
    (0, common_1.Get)('deliverables'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "listDeliverables", null);
__decorate([
    (0, common_1.Get)('deliverables/:id/download'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('x-lgpd-purpose')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "getDeliverableDownload", null);
__decorate([
    (0, common_1.Get)('audit'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'LEITOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('action')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ReurbController.prototype, "listAuditLogs", null);
exports.ReurbController = ReurbController = __decorate([
    (0, swagger_1.ApiTags)('reurb'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reurb'),
    __metadata("design:paramtypes", [reurb_service_1.ReurbService])
], ReurbController);
//# sourceMappingURL=reurb.controller.js.map