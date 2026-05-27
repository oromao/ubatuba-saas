import { LgpdAuditService } from '../../common/services/lgpd-audit.service';
import { TenantRequest } from '../../common/guards/tenant.guard';
export declare class LgpdController {
    private readonly audit;
    constructor(audit: LgpdAuditService);
    recordConsent(body: {
        resourceType: string;
        resourceId: string;
        fields?: string[];
        consentId?: string;
    }, req: TenantRequest): Promise<{
        recorded: boolean;
        message: string;
    }>;
    requestDeletion(body: {
        resourceType: string;
        resourceId: string;
        reason?: string;
    }, req: TenantRequest): Promise<{
        message: string;
        protocol: string;
    }>;
    getAuditTrail(tenantId: string, _req: TenantRequest): Promise<{
        tenantId: string;
        entries: import("../../common/schemas/lgpd-audit.schema").LgpdAuditDocument[];
        total: number;
    }>;
    getAuditCount(tenantId: string): Promise<{
        tenantId: string;
        total: number;
    }>;
}
