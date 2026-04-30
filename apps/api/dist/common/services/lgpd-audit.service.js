"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LgpdAuditService = void 0;
const common_1 = require("@nestjs/common");
let LgpdAuditService = class LgpdAuditService {
    constructor() {
        this.auditLog = [];
    }
    logAccess(entry) {
        this.auditLog.push({
            ...entry,
            ...{ timestamp: new Date().toISOString() },
        });
    }
    query(filters) {
        return this.auditLog.filter((entry) => {
            if (filters.tenantId && entry.tenantId !== filters.tenantId)
                return false;
            if (filters.resourceType && entry.resourceType !== filters.resourceType)
                return false;
            if (filters.resourceId && entry.resourceId !== filters.resourceId)
                return false;
            if (filters.action && entry.action !== filters.action)
                return false;
            return true;
        });
    }
    anonymize(resourceType, resourceId) {
        this.logAccess({
            tenantId: 'system',
            action: 'ANONYMIZE',
            resourceType: resourceType,
            resourceId,
        });
        return { anonymized: true };
    }
};
exports.LgpdAuditService = LgpdAuditService;
exports.LgpdAuditService = LgpdAuditService = __decorate([
    (0, common_1.Injectable)()
], LgpdAuditService);
//# sourceMappingURL=lgpd-audit.service.js.map