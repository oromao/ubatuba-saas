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
exports.ValuationsController = void 0;
const common_1 = require("@nestjs/common");
const valuations_service_1 = require("./valuations.service");
const calculate_valuation_dto_1 = require("./dto/calculate-valuation.dto");
const roles_decorator_1 = require("../../../common/guards/roles.decorator");
const roles_guard_1 = require("../../../common/guards/roles.guard");
let ValuationsController = class ValuationsController {
    constructor(valuationsService) {
        this.valuationsService = valuationsService;
    }
    list(req, projectId) {
        return this.valuationsService.list(req.tenantId, projectId);
    }
    byParcel(req, id, projectId) {
        return this.valuationsService.byParcel(req.tenantId, projectId, id);
    }
    trace(req, id, projectId) {
        return this.valuationsService.getCalculationTrace(req.tenantId, projectId, id);
    }
    calculate(req, dto) {
        return this.valuationsService.calculate(req.tenantId, dto, req.user?.sub);
    }
    async exportCsv(req, projectId, res) {
        const csv = await this.valuationsService.exportCsv(req.tenantId, projectId);
        res.setHeader('Content-Type', 'text/csv');
        res.send(csv);
    }
    exportGeojson(req, projectId, bbox) {
        return this.valuationsService.exportParcelsGeojson(req.tenantId, projectId, bbox);
    }
    impactReport(req, projectId, baseVersionId, targetVersionId) {
        return this.valuationsService.getImpactReport(req.tenantId, projectId, baseVersionId, targetVersionId);
    }
};
exports.ValuationsController = ValuationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ValuationsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('parcel/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ValuationsController.prototype, "byParcel", null);
__decorate([
    (0, common_1.Get)('parcel/:id/trace'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ValuationsController.prototype, "trace", null);
__decorate([
    (0, common_1.Post)('calculate'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'GESTOR', 'OPERADOR'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calculate_valuation_dto_1.CalculateValuationDto]),
    __metadata("design:returntype", void 0)
], ValuationsController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ValuationsController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/geojson'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('bbox')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ValuationsController.prototype, "exportGeojson", null);
__decorate([
    (0, common_1.Get)('impact-report'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('baseVersionId')),
    __param(3, (0, common_1.Query)('targetVersionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], ValuationsController.prototype, "impactReport", null);
exports.ValuationsController = ValuationsController = __decorate([
    (0, common_1.Controller)('pgv/valuations'),
    __metadata("design:paramtypes", [valuations_service_1.ValuationsService])
], ValuationsController);
//# sourceMappingURL=valuations.controller.js.map