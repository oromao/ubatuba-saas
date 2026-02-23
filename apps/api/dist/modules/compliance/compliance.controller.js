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
exports.ComplianceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const compliance_service_1 = require("./compliance.service");
const compliance_dto_1 = require("./dto/compliance.dto");
let ComplianceController = class ComplianceController {
    constructor(service) {
        this.service = service;
    }
    getProfile(req, projectId) {
        return this.service.getProfile(req.tenantId, projectId);
    }
    upsertCompany(req, projectId, dto) {
        return this.service.upsertCompany(req.tenantId, projectId, dto, req.user?.sub);
    }
    addResponsible(req, projectId, dto) {
        return this.service.addResponsible(req.tenantId, projectId, dto, req.user?.sub);
    }
    updateResponsible(req, projectId, id, dto) {
        return this.service.updateResponsible(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    deleteResponsible(req, projectId, id) {
        return this.service.deleteResponsible(req.tenantId, projectId, id, req.user?.sub);
    }
    addArtRrt(req, projectId, dto) {
        return this.service.addArtRrt(req.tenantId, projectId, dto, req.user?.sub);
    }
    updateArtRrt(req, projectId, id, dto) {
        return this.service.updateArtRrt(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    deleteArtRrt(req, projectId, id) {
        return this.service.deleteArtRrt(req.tenantId, projectId, id, req.user?.sub);
    }
    addCat(req, projectId, dto) {
        return this.service.addCat(req.tenantId, projectId, dto, req.user?.sub);
    }
    updateCat(req, projectId, id, dto) {
        return this.service.updateCat(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    deleteCat(req, projectId, id) {
        return this.service.deleteCat(req.tenantId, projectId, id, req.user?.sub);
    }
    addTeamMember(req, projectId, dto) {
        return this.service.addTeamMember(req.tenantId, projectId, dto, req.user?.sub);
    }
    updateTeamMember(req, projectId, id, dto) {
        return this.service.updateTeamMember(req.tenantId, projectId, id, dto, req.user?.sub);
    }
    deleteTeamMember(req, projectId, id) {
        return this.service.deleteTeamMember(req.tenantId, projectId, id, req.user?.sub);
    }
    upsertChecklist(req, projectId, dto) {
        return this.service.upsertChecklistItem(req.tenantId, projectId, dto, req.user?.sub);
    }
};
exports.ComplianceController = ComplianceController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('company'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, compliance_dto_1.UpsertCompanyDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "upsertCompany", null);
__decorate([
    (0, common_1.Post)('responsibles'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, compliance_dto_1.UpsertResponsibleDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "addResponsible", null);
__decorate([
    (0, common_1.Patch)('responsibles/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, compliance_dto_1.UpsertResponsibleDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "updateResponsible", null);
__decorate([
    (0, common_1.Delete)('responsibles/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "deleteResponsible", null);
__decorate([
    (0, common_1.Post)('art-rrt'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, compliance_dto_1.UpsertArtRrtDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "addArtRrt", null);
__decorate([
    (0, common_1.Patch)('art-rrt/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, compliance_dto_1.UpsertArtRrtDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "updateArtRrt", null);
__decorate([
    (0, common_1.Delete)('art-rrt/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "deleteArtRrt", null);
__decorate([
    (0, common_1.Post)('cats'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, compliance_dto_1.UpsertCatDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "addCat", null);
__decorate([
    (0, common_1.Patch)('cats/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, compliance_dto_1.UpsertCatDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "updateCat", null);
__decorate([
    (0, common_1.Delete)('cats/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "deleteCat", null);
__decorate([
    (0, common_1.Post)('team'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, compliance_dto_1.UpsertTeamMemberDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "addTeamMember", null);
__decorate([
    (0, common_1.Patch)('team/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, compliance_dto_1.UpsertTeamMemberDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "updateTeamMember", null);
__decorate([
    (0, common_1.Delete)('team/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "deleteTeamMember", null);
__decorate([
    (0, common_1.Put)('checklist'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, compliance_dto_1.UpsertChecklistItemDto]),
    __metadata("design:returntype", void 0)
], ComplianceController.prototype, "upsertChecklist", null);
exports.ComplianceController = ComplianceController = __decorate([
    (0, swagger_1.ApiTags)('compliance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('compliance'),
    __metadata("design:paramtypes", [compliance_service_1.ComplianceService])
], ComplianceController);
//# sourceMappingURL=compliance.controller.js.map