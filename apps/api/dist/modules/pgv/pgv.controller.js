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
exports.PgvController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../../common/guards/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const valuations_service_1 = require("./valuations/valuations.service");
const calculate_valuation_dto_1 = require("./valuations/dto/calculate-valuation.dto");
const recalculate_batch_dto_1 = require("./valuations/dto/recalculate-batch.dto");
let PgvController = class PgvController {
    constructor(valuationsService) {
        this.valuationsService = valuationsService;
    }
    calculate(req, dto) {
        return this.valuationsService.calculate(req.tenantId, dto, req.user?.sub);
    }
    recalculateBatch(req, dto) {
        return this.valuationsService.recalculateBatch(req.tenantId, dto, req.user?.sub);
    }
    async reportCsv(req, projectId, res) {
        const csv = await this.valuationsService.exportCsv(req.tenantId, projectId);
        res.setHeader('Content-Type', 'text/csv');
        res.send(csv);
    }
    parcelsGeojson(req, projectId, bbox) {
        return this.valuationsService.exportParcelsGeojson(req.tenantId, projectId, bbox);
    }
};
exports.PgvController = PgvController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calculate_valuation_dto_1.CalculateValuationDto]),
    __metadata("design:returntype", void 0)
], PgvController.prototype, "calculate", null);
__decorate([
    (0, common_1.Post)('recalculate-batch'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, recalculate_batch_dto_1.RecalculateBatchDto]),
    __metadata("design:returntype", void 0)
], PgvController.prototype, "recalculateBatch", null);
__decorate([
    (0, common_1.Get)('report.csv'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PgvController.prototype, "reportCsv", null);
__decorate([
    (0, common_1.Get)('parcels.geojson'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PgvController.prototype, "parcelsGeojson", null);
exports.PgvController = PgvController = __decorate([
    (0, common_1.Controller)('pgv'),
    __metadata("design:paramtypes", [valuations_service_1.ValuationsService])
], PgvController);
//# sourceMappingURL=pgv.controller.js.map