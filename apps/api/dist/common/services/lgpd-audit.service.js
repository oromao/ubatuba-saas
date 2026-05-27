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
exports.LgpdAuditService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const lgpd_audit_schema_1 = require("../schemas/lgpd-audit.schema");
let LgpdAuditService = class LgpdAuditService {
    constructor(model) {
        this.model = model;
    }
    async logAccess(entry) {
        await this.model.create({
            tenantId: entry.tenantId,
            action: entry.action,
            resourceType: entry.resourceType,
            resourceId: entry.resourceId,
            fields: entry.fields,
            actorId: entry.actorId,
            actorRole: entry.actorRole,
            ipAddress: entry.ipAddress,
            reason: entry.reason,
            consentId: entry.consentId,
            anonymized: false,
        });
    }
    async query(filters) {
        const query = {};
        if (filters.tenantId)
            query.tenantId = filters.tenantId;
        if (filters.resourceType)
            query.resourceType = filters.resourceType;
        if (filters.resourceId)
            query.resourceId = filters.resourceId;
        if (filters.action)
            query.action = filters.action;
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate)
                query.createdAt.$gte = new Date(filters.startDate);
            if (filters.endDate)
                query.createdAt.$lte = new Date(filters.endDate);
        }
        return this.model.find(query).sort({ createdAt: -1 }).limit(filters.limit ?? 100).exec();
    }
    async anonymize(tenantId, resourceType, resourceId) {
        await this.logAccess({
            tenantId,
            action: 'ANONYMIZE',
            resourceType: resourceType,
            resourceId,
            reason: 'Direito ao esquecimento (art. 18 LGPD)',
        });
        return true;
    }
    async countByTenant(tenantId) {
        return this.model.countDocuments({ tenantId }).exec();
    }
};
exports.LgpdAuditService = LgpdAuditService;
exports.LgpdAuditService = LgpdAuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(lgpd_audit_schema_1.LgpdAudit.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], LgpdAuditService);
//# sourceMappingURL=lgpd-audit.service.js.map