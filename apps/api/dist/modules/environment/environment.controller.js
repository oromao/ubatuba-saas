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
exports.EnvironmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_environment_case_dto_1 = require("./dto/create-environment-case.dto");
const update_environment_case_dto_1 = require("./dto/update-environment-case.dto");
const environment_service_1 = require("./environment.service");
let EnvironmentController = class EnvironmentController {
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
    issueReport(req, id) {
        return this.service.issueReport(req.tenantId, id);
    }
};
exports.EnvironmentController = EnvironmentController;
__decorate([
    (0, common_1.Get)('cases'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnvironmentController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EnvironmentController.prototype, "summary", null);
__decorate([
    (0, common_1.Get)('cases/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EnvironmentController.prototype, "get", null);
__decorate([
    (0, common_1.Post)('cases'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_environment_case_dto_1.CreateEnvironmentCaseDto]),
    __metadata("design:returntype", void 0)
], EnvironmentController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('cases/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_environment_case_dto_1.UpdateEnvironmentCaseDto]),
    __metadata("design:returntype", void 0)
], EnvironmentController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('cases/:id/report'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], EnvironmentController.prototype, "issueReport", null);
exports.EnvironmentController = EnvironmentController = __decorate([
    (0, swagger_1.ApiTags)('environment'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('environment'),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService])
], EnvironmentController);
//# sourceMappingURL=environment.controller.js.map