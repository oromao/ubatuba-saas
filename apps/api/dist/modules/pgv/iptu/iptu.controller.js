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
exports.IptuController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const iptu_service_1 = require("./iptu.service");
let IptuController = class IptuController {
    constructor(iptuService) {
        this.iptuService = iptuService;
    }
    async calcular(body) {
        return this.iptuService.calculateForParcel(body);
    }
    async calcularLote(body) {
        return this.iptuService.calculateBatch(body.tenantId, body.projectId, body.year, body.zoneId);
    }
    async aliquota(parcelId) {
        return this.iptuService.getAliquota(parcelId);
    }
};
exports.IptuController = IptuController;
__decorate([
    (0, common_1.Post)('calcular'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Calcular IPTU para uma parcela',
        description: 'Calcula o IPTU devido (valor venal × alíquota) para uma parcela específica.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resultado do cálculo IPTU' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IptuController.prototype, "calcular", null);
__decorate([
    (0, common_1.Post)('calcular/lote'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Calcular IPTU em lote',
        description: 'Calcula o IPTU para todas as parcelas de um projeto (ou zona).',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resultado do cálculo em lote' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IptuController.prototype, "calcularLote", null);
__decorate([
    (0, common_1.Get)('aliquota'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Consultar alíquota IPTU de uma parcela',
        description: 'Retorna a alíquota IPTU efetiva para uma parcela, baseada na sua zona.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'parcelId', required: true, description: 'ID da parcela' }),
    __param(0, (0, common_1.Query)('parcelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IptuController.prototype, "aliquota", null);
exports.IptuController = IptuController = __decorate([
    (0, swagger_1.ApiTags)('IPTU'),
    (0, common_1.Controller)('iptu'),
    __metadata("design:paramtypes", [iptu_service_1.IptuService])
], IptuController);
//# sourceMappingURL=iptu.controller.js.map