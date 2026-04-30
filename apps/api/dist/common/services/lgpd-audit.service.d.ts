export interface AuditEntry {
    tenantId: string;
    action: 'READ_PERSONAL_DATA' | 'EXPORT_PERSONAL_DATA' | 'DELETE_PERSONAL_DATA' | 'ANONYMIZE';
    resourceType: 'PARCEL' | 'CITIZEN' | 'VISTORIA' | 'CERTIFICATE';
    resourceId: string;
    fields?: string[];
    actorId?: string;
    actorRole?: string;
    ipAddress?: string;
    reason?: string;
}
export declare class LgpdAuditService {
    private auditLog;
    logAccess(entry: AuditEntry): void;
    query(filters: {
        tenantId?: string;
        resourceType?: string;
        resourceId?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
    }): AuditEntry[];
    anonymize(resourceType: string, resourceId: string): {
        anonymized: boolean;
    };
}
