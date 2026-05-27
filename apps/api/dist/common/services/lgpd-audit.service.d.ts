import { Model } from 'mongoose';
import { LgpdAuditDocument } from '../schemas/lgpd-audit.schema';
export interface AuditEntry {
    tenantId: string;
    action: 'READ_PERSONAL_DATA' | 'EXPORT_PERSONAL_DATA' | 'DELETE_PERSONAL_DATA' | 'ANONYMIZE' | 'CONSENT_RECORDED';
    resourceType: 'PARCEL' | 'CITIZEN' | 'VISTORIA' | 'CERTIFICATE' | 'CITIZEN_CALL';
    resourceId: string;
    fields?: string[];
    actorId?: string;
    actorRole?: string;
    ipAddress?: string;
    reason?: string;
    consentId?: string;
}
export declare class LgpdAuditService {
    private readonly model;
    constructor(model: Model<LgpdAuditDocument>);
    logAccess(entry: AuditEntry): Promise<void>;
    query(filters: {
        tenantId?: string;
        resourceType?: string;
        resourceId?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<LgpdAuditDocument[]>;
    anonymize(tenantId: string, resourceType: string, resourceId: string): Promise<boolean>;
    countByTenant(tenantId: string): Promise<number>;
}
