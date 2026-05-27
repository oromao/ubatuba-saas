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
const cache_service_1 = require("../shared/cache.service");
const lgpd_audit_service_1 = require("../../common/services/lgpd-audit.service");
const mongoose_1 = require("mongoose");
let PublicCallsController = class PublicCallsController {
    constructor(service, tenantsService, cacheService, lgpdAudit) {
        this.service = service;
        this.tenantsService = tenantsService;
        this.cacheService = cacheService;
        this.lgpdAudit = lgpdAudit;
    }
    async checkRateLimit(ip) {
        const key = `rate-limit:citizen:${ip}`;
        const count = (await this.cacheService.get(key)) || 0;
        if (count >= 10) {
            throw new common_1.BadRequestException('Muitas solicitacoes. Tente novamente mais tarde.');
        }
        await this.cacheService.set(key, count + 1, 60);
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
    async createPublicCall(body, req) {
        if (!body.title || !body.category) {
            throw new common_1.BadRequestException('Titulo e categoria sao obrigatorios');
        }
        if (body.reporterName || body.reporterContact) {
            if (!body.lgpdConsent) {
                throw new common_1.ForbiddenException('Consentimento LGPD obrigatório para fornecimento de dados pessoais. Marque a caixa de consentimento.');
            }
        }
        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        await this.checkRateLimit(ip);
        const tenantId = await this.resolveTenantId(body);
        const { address, ...rest } = body;
        const title = address ? `${rest.title} — ${address}` : rest.title;
        const created = await this.service.create(tenantId, {
            ...rest,
            title,
            attachmentKeys: body.attachmentKeys || [],
            lgpdConsentAt: new Date(),
            lgpdConsentVersion: body.lgpdConsentVersion || 'v1.0-2026-05',
            lgpdConsentId: `consent-${Date.now().toString(36)}`,
        }, 'CIDADAO');
        await this.lgpdAudit.logAccess({
            tenantId,
            action: 'CONSENT_RECORDED',
            resourceType: 'CITIZEN_CALL',
            resourceId: String(created._id || created.protocolNumber),
            fields: body.reporterName ? ['reporterName', 'reporterContact'] : undefined,
            ipAddress: ip,
            reason: 'Consentimento explicito para coleta de dados pessoais (art. 7 LGPD)',
            consentId: body.lgpdConsentVersion || 'v1.0-2026-05',
        });
        return {
            protocolNumber: created.protocolNumber,
            status: created.status,
            message: `Chamado registrado com sucesso. Protocolo: ${created.protocolNumber}`,
        };
    }
    async createCitizenRequest(body, req) {
        return this.createPublicCall(body, req);
    }
    async getCallStatus(protocol) {
        const call = await this.service.findByProtocol(protocol);
        if (!call) {
            return { found: false, message: 'Protocolo nao encontrado. Verifique o numero e tente novamente.' };
        }
        return {
            found: true,
            protocolNumber: call.protocolNumber,
            status: call.status,
            category: call.category,
            title: call.title,
            createdAt: call.createdAt,
            history: (call.history || []).map((h) => ({
                status: h.status,
                message: h.message,
                date: h.createdAt,
            })),
        };
    }
};
exports.PublicCallsController = PublicCallsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('calls'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PublicCallsController.prototype, "createPublicCall", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('cidadao/solicitacoes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
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
        tenants_service_1.TenantsService,
        cache_service_1.CacheService,
        lgpd_audit_service_1.LgpdAuditService])
], PublicCallsController);
//# sourceMappingURL=public-calls.controller.js.map