import { Request } from 'express';
import { Citizen156Service } from './citizen-156.service';
import { TenantsService } from '../tenants/tenants.service';
import { CacheService } from '../shared/cache.service';
import { LgpdAuditService } from '../../common/services/lgpd-audit.service';
type PublicCreateCallDto = {
    tenantId?: string;
    tenantSlug?: string;
    title: string;
    category: string;
    description?: string;
    reporterName?: string;
    reporterContact?: string;
    address?: string;
    attachmentKeys?: string[];
    lgpdConsent?: boolean;
    lgpdConsentVersion?: string;
};
export declare class PublicCallsController {
    private readonly service;
    private readonly tenantsService;
    private readonly cacheService;
    private readonly lgpdAudit;
    constructor(service: Citizen156Service, tenantsService: TenantsService, cacheService: CacheService, lgpdAudit: LgpdAuditService);
    private checkRateLimit;
    private resolveTenantId;
    createPublicCall(body: PublicCreateCallDto, req: Request): Promise<{
        protocolNumber: any;
        status: any;
        message: string;
    }>;
    createCitizenRequest(body: PublicCreateCallDto, req: Request): Promise<{
        protocolNumber: any;
        status: any;
        message: string;
    }>;
    getCallStatus(protocol: string): Promise<{
        found: boolean;
        message: string;
        protocolNumber?: undefined;
        status?: undefined;
        category?: undefined;
        title?: undefined;
        createdAt?: undefined;
        history?: undefined;
    } | {
        found: boolean;
        protocolNumber: string;
        status: import("./citizen-call.schema").CitizenCallStatus;
        category: string;
        title: string;
        createdAt: any;
        history: {
            status: any;
            message: any;
            date: any;
        }[];
        message?: undefined;
    }>;
}
export {};
