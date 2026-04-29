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
exports.PublicWorksController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const add_evidence_dto_1 = require("./dto/add-evidence.dto");
const add_measurement_dto_1 = require("./dto/add-measurement.dto");
const advance_public_work_dto_1 = require("./dto/advance-public-work.dto");
const create_public_work_dto_1 = require("./dto/create-public-work.dto");
const update_public_work_dto_1 = require("./dto/update-public-work.dto");
const public_works_service_1 = require("./public-works.service");
let PublicWorksController = class PublicWorksController {
    constructor(service) {
        this.service = service;
    }
    list(req) {
        return this.service.list(req.tenantId);
    }
    summary(req) {
        return this.service.summary(req.tenantId);
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
    advanceStage(req, id, dto) {
        return this.service.advanceStage(req.tenantId, id, dto, req.user?.sub);
    }
    addMeasurement(req, id, dto) {
        return this.service.addMeasurement(req.tenantId, id, dto, req.user?.sub);
    }
    addEvidence(req, id, dto) {
        return this.service.addEvidence(req.tenantId, id, dto, req.user?.sub);
    }
    remove(req, id) {
        return this.service.remove(req.tenantId, id);
    }
};
exports.PublicWorksController = PublicWorksController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicWorksController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PublicWorksController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PublicWorksController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_public_work_dto_1.CreatePublicWorkDto]),
    __metadata("design:returntype", void 0)
], PublicWorksController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_public_work_dto_1.UpdatePublicWorkDto]),
    __metadata("design:returntype", void 0)
], PublicWorksController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/stage'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, advance_public_work_dto_1.AdvancePublicWorkDto]),
    __metadata("design:returntype", void 0)
], PublicWorksController.prototype, "advanceStage", null);
__decorate([
    (0, common_1.Post)(':id/measurements'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_measurement_dto_1.AddMeasurementDto]),
    __metadata("design:returntype", void 0)
], PublicWorksController.prototype, "addMeasurement", null);
__decorate([
    (0, common_1.Post)(':id/evidence'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_evidence_dto_1.AddEvidenceDto]),
    __metadata("design:returntype", void 0)
], PublicWorksController.prototype, "addEvidence", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PublicWorksController.prototype, "remove", null);
exports.PublicWorksController = PublicWorksController = __decorate([
    (0, common_1.Controller)('public-works'),
    __metadata("design:paramtypes", [public_works_service_1.PublicWorksService])
], PublicWorksController);
//# sourceMappingURL=public-works.controller.js.map