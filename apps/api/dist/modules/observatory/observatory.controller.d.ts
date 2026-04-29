import { ObservatoryService } from './observatory.service';
export declare class ObservatoryController {
    private readonly service;
    constructor(service: ObservatoryService);
    market(req: {
        tenantId: string;
    }, projectId?: string, focus?: string, neighborhood?: string, street?: string, zoneId?: string, compare?: 'all' | 'city' | 'zone' | 'street'): Promise<{}>;
    exportMarketCsv(req: {
        tenantId: string;
    }, projectId?: string, focus?: string, neighborhood?: string, street?: string, zoneId?: string, compare?: 'all' | 'city' | 'zone' | 'street'): Promise<{
        fileName: string;
        contentType: string;
        csv: string;
        summary: any;
    }>;
}
