import { Citizen156Service } from './citizen-156.service';
import { TenantsService } from '../tenants/tenants.service';
type PublicCreateCallDto = {
    tenantId?: string;
    tenantSlug?: string;
    title: string;
    category: string;
    description?: string;
    reporterName?: string;
    reporterContact?: string;
    address?: string;
};
export declare class PublicCallsController {
    private readonly service;
    private readonly tenantsService;
    constructor(service: Citizen156Service, tenantsService: TenantsService);
    private resolveTenantId;
    createPublicCall(body: PublicCreateCallDto): Promise<{
        protocolNumber: any;
        status: any;
        message: string;
    }>;
    createCitizenRequest(body: PublicCreateCallDto): Promise<{
        protocolNumber: any;
        status: any;
        message: string;
    }>;
    getCallStatus(_protocol: string): Promise<{
        message: string;
    }>;
}
export {};
