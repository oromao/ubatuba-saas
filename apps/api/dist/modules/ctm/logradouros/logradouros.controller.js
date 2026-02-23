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
exports.LogradourosController = void 0;
const common_1 = require("@nestjs/common");
const logradouros_service_1 = require("./logradouros.service");
const create_logradouro_dto_1 = require("./dto/create-logradouro.dto");
const update_logradouro_dto_1 = require("./dto/update-logradouro.dto");
const roles_decorator_1 = require("../../../common/guards/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
let LogradourosController = class LogradourosController {
    constructor(logradourosService) {
        this.logradourosService = logradourosService;
    }
    list(req, projectId) {
        return this.logradourosService.list(req.tenantId, projectId);
    }
    get(req, id, projectId) {
        return this.logradourosService.findById(req.tenantId, projectId, id);
    }
    create(req, projectId, dto) {
        return this.logradourosService.create(req.tenantId, projectId, dto, req.user?.sub);
    }
    update(req, id, projectId, dto) {
        return this.logradourosService.update(req.tenantId, projectId, id, dto);
    }
    remove(req, id, projectId) {
        return this.logradourosService.remove(req.tenantId, projectId, id);
    }
};
exports.LogradourosController = LogradourosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LogradourosController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], LogradourosController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, create_logradouro_dto_1.CreateLogradouroDto]),
    __metadata("design:returntype", void 0)
], LogradourosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, update_logradouro_dto_1.UpdateLogradouroDto]),
    __metadata("design:returntype", void 0)
], LogradourosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], LogradourosController.prototype, "remove", null);
exports.LogradourosController = LogradourosController = __decorate([
    (0, common_1.Controller)('ctm/logradouros'),
    __metadata("design:paramtypes", [logradouros_service_1.LogradourosService])
], LogradourosController);
//# sourceMappingURL=logradouros.controller.js.map