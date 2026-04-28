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
exports.ObservatoryController = void 0;
const common_1 = require("@nestjs/common");
const observatory_service_1 = require("./observatory.service");
let ObservatoryController = class ObservatoryController {
    constructor(service) {
        this.service = service;
    }
    market(req, projectId, focus, neighborhood, street, zoneId, compare) {
        return this.service.marketOverview(req.tenantId, projectId, focus, {
            neighborhood,
            street,
            zoneId,
            compare,
        });
    }
    exportMarketCsv(req, projectId, focus, neighborhood, street, zoneId, compare) {
        return this.service.exportMarketCsv(req.tenantId, projectId, focus, {
            neighborhood,
            street,
            zoneId,
            compare,
        });
    }
};
exports.ObservatoryController = ObservatoryController;
__decorate([
    (0, common_1.Get)('market'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('focus')),
    __param(3, (0, common_1.Query)('neighborhood')),
    __param(4, (0, common_1.Query)('street')),
    __param(5, (0, common_1.Query)('zoneId')),
    __param(6, (0, common_1.Query)('compare')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ObservatoryController.prototype, "market", null);
__decorate([
    (0, common_1.Get)('market/export.csv'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('focus')),
    __param(3, (0, common_1.Query)('neighborhood')),
    __param(4, (0, common_1.Query)('street')),
    __param(5, (0, common_1.Query)('zoneId')),
    __param(6, (0, common_1.Query)('compare')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ObservatoryController.prototype, "exportMarketCsv", null);
exports.ObservatoryController = ObservatoryController = __decorate([
    (0, common_1.Controller)('observatory'),
    __metadata("design:paramtypes", [observatory_service_1.ObservatoryService])
], ObservatoryController);
//# sourceMappingURL=observatory.controller.js.map