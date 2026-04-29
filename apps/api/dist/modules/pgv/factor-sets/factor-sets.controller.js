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
exports.FactorSetsController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../../common/guards/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
const factor_sets_service_1 = require("./factor-sets.service");
const update_factor_set_dto_1 = require("./dto/update-factor-set.dto");
let FactorSetsController = class FactorSetsController {
    constructor(factorSetsService) {
        this.factorSetsService = factorSetsService;
    }
    get(req, projectId) {
        return this.factorSetsService.get(req.tenantId, projectId);
    }
    update(req, dto) {
        return this.factorSetsService.update(req.tenantId, dto, req.user?.sub);
    }
};
exports.FactorSetsController = FactorSetsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FactorSetsController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_factor_set_dto_1.UpdateFactorSetDto]),
    __metadata("design:returntype", void 0)
], FactorSetsController.prototype, "update", null);
exports.FactorSetsController = FactorSetsController = __decorate([
    (0, common_1.Controller)('pgv/factor-sets'),
    __metadata("design:paramtypes", [factor_sets_service_1.FactorSetsService])
], FactorSetsController);
//# sourceMappingURL=factor-sets.controller.js.map