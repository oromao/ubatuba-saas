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
exports.PermitsWorksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_permit_work_dto_1 = require("./dto/create-permit-work.dto");
const update_permit_work_dto_1 = require("./dto/update-permit-work.dto");
const permits_works_service_1 = require("./permits-works.service");
let PermitsWorksController = class PermitsWorksController {
    constructor(service) {
        this.service = service;
    }
    list(req) {
        return this.service.list(req.tenantId);
    }
    get(req, id) {
        return this.service.findById(req.tenantId, id);
    }
    create(req, dto) {
        return this.service.create(req.tenantId, dto, req.user?.sub);
    }
    update(req, id, dto) {
        return this.service.update(req.tenantId, id, dto, req.user?.sub);
    }
    addEvidence(req, id, dto) {
        return this.service.addEvidence(req.tenantId, id, dto.title, dto.note, dto.fileName, req.user?.sub);
    }
    respondRequirement(req, id, requirementId, dto) {
        return this.service.addRequirementResponse(req.tenantId, id, requirementId, dto.note, req.user?.sub);
    }
    decide(req, id, dto) {
        return this.service.decide(req.tenantId, id, dto.decision, dto.reason, req.user?.sub);
    }
    addInvoice(req, id, dto) {
        return this.service.addInvoice(req.tenantId, id, dto.description, dto.amount);
    }
    issue(req, id) {
        return this.service.issueDecisionPdf(req.tenantId, id);
    }
};
exports.PermitsWorksController = PermitsWorksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_permit_work_dto_1.CreatePermitWorkDto]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_permit_work_dto_1.UpdatePermitWorkDto]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/evidences'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "addEvidence", null);
__decorate([
    (0, common_1.Post)(':id/requirements/:requirementId/response'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('requirementId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "respondRequirement", null);
__decorate([
    (0, common_1.Post)(':id/decision'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "decide", null);
__decorate([
    (0, common_1.Post)(':id/invoices'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "addInvoice", null);
__decorate([
    (0, common_1.Post)(':id/issue'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PermitsWorksController.prototype, "issue", null);
exports.PermitsWorksController = PermitsWorksController = __decorate([
    (0, swagger_1.ApiTags)('permits-works'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('permits-works'),
    __metadata("design:paramtypes", [permits_works_service_1.PermitsWorksService])
], PermitsWorksController);
//# sourceMappingURL=permits-works.controller.js.map