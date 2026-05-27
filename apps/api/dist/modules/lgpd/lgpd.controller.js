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
exports.LgpdController = void 0;
const common_1 = require("@nestjs/common");
const lgpd_audit_service_1 = require("../../common/services/lgpd-audit.service");
let LgpdController = class LgpdController {
    constructor(audit) {
        this.audit = audit;
    }
    async recordConsent(body, req) {
        await this.audit.logAccess({
            tenantId: req.tenantId || 'public',
            action: 'CONSENT_RECORDED',
            resourceType: body.resourceType,
            resourceId: body.resourceId,
            fields: body.fields,
            ipAddress: req.ip,
            consentId: body.consentId,
            reason: 'Consentimento explicito do titular (art. 7 LGPD)',
        });
        return { recorded: true, message: 'Consentimento registrado conforme art. 7 LGPD' };
    }
    async requestDeletion(body, req) {
        await this.audit.logAccess({
            tenantId: req.tenantId || 'public',
            action: 'DELETE_PERSONAL_DATA',
            resourceType: body.resourceType,
            resourceId: body.resourceId,
            ipAddress: req.ip,
            reason: body.reason || 'Direito ao esquecimento (art. 18 LGPD)',
        });
        await this.audit.anonymize(req.tenantId || 'public', body.resourceType, body.resourceId);
        return {
            message: 'Solicitação de anonimização registrada. Seus dados serão anonimizados em até 15 dias úteis (art. 18 §2 LGPD).',
            protocol: `LGPD-${Date.now().toString(36)}`,
        };
    }
    async getAuditTrail(tenantId, _req) {
        const entries = await this.audit.query({ tenantId });
        return { tenantId, entries, total: entries.length };
    }
    async getAuditCount(tenantId) {
        const total = await this.audit.countByTenant(tenantId);
        return { tenantId, total };
    }
};
exports.LgpdController = LgpdController;
__decorate([
    (0, common_1.Post)('consent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LgpdController.prototype, "recordConsent", null);
__decorate([
    (0, common_1.Post)('delete-request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LgpdController.prototype, "requestDeletion", null);
__decorate([
    (0, common_1.Get)('audit/:tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LgpdController.prototype, "getAuditTrail", null);
__decorate([
    (0, common_1.Get)('audit/:tenantId/count'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LgpdController.prototype, "getAuditCount", null);
exports.LgpdController = LgpdController = __decorate([
    (0, common_1.Controller)('lgpd'),
    __metadata("design:paramtypes", [lgpd_audit_service_1.LgpdAuditService])
], LgpdController);
//# sourceMappingURL=lgpd.controller.js.map