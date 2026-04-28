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
exports.PublicCallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/guards/public.decorator");
const citizen_156_service_1 = require("./citizen-156.service");
const tenants_service_1 = require("../tenants/tenants.service");
const mongoose_1 = require("mongoose");
let PublicCallsController = class PublicCallsController {
    constructor(service, tenantsService) {
        this.service = service;
        this.tenantsService = tenantsService;
    }
    async resolveTenantId(dto) {
        if (dto.tenantSlug) {
            const tenant = await this.tenantsService.findBySlug(dto.tenantSlug);
            if (tenant?._id)
                return tenant._id.toString();
        }
        if (dto.tenantId) {
            const isObjectId = mongoose_1.Types.ObjectId.isValid(dto.tenantId);
            if (isObjectId)
                return dto.tenantId;
            const tenantBySlug = await this.tenantsService.findBySlug(dto.tenantId);
            if (tenantBySlug?._id)
                return tenantBySlug._id.toString();
        }
        const demoTenant = await this.tenantsService.findBySlug('demo');
        if (demoTenant?._id)
            return demoTenant._id.toString();
        throw new common_1.BadRequestException('Tenant público não encontrado.');
    }
    async createPublicCall(body) {
        const tenantId = await this.resolveTenantId(body);
        const { description: _description, address, tenantSlug: _tenantSlug, tenantId: _tenantId, ...rest } = body;
        const title = address ? `${rest.title} — ${address}` : rest.title;
        const created = await this.service.create(tenantId, {
            ...rest,
            title,
            attachmentKeys: [],
        }, 'CIDADAO');
        return {
            protocolNumber: created.protocolNumber,
            status: created.status,
            message: `Chamado registrado com sucesso. Protocolo: ${created.protocolNumber}`,
        };
    }
    async createCitizenRequest(body) {
        return this.createPublicCall(body);
    }
    async getCallStatus(_protocol) {
        return { message: 'Use o protocolo com o município para consultar o status.' };
    }
};
exports.PublicCallsController = PublicCallsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('calls'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicCallsController.prototype, "createPublicCall", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('cidadao/solicitacoes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicCallsController.prototype, "createCitizenRequest", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('calls/:protocol/status'),
    __param(0, (0, common_1.Param)('protocol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicCallsController.prototype, "getCallStatus", null);
exports.PublicCallsController = PublicCallsController = __decorate([
    (0, swagger_1.ApiTags)('public'),
    (0, common_1.Controller)('public'),
    __metadata("design:paramtypes", [citizen_156_service_1.Citizen156Service,
        tenants_service_1.TenantsService])
], PublicCallsController);
//# sourceMappingURL=public-calls.controller.js.map