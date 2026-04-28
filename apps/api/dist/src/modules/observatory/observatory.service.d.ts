import { ParcelsService } from '../ctm/parcels/parcels.service';
import { MonitoringService } from '../monitoring/monitoring.service';
import { ProjectsService } from '../projects/projects.service';
import { ValuationsService } from '../pgv/valuations/valuations.service';
import { CacheService } from '../shared/cache.service';
type MarketFilter = {
    neighborhood?: string;
    street?: string;
    zoneId?: string;
    compare?: 'all' | 'city' | 'zone' | 'street';
};
export declare class ObservatoryService {
    private readonly parcelsService;
    private readonly valuationsService;
    private readonly monitoringService;
    private readonly projectsService;
    private readonly cacheService;
    constructor(parcelsService: ParcelsService, valuationsService: ValuationsService, monitoringService: MonitoringService, projectsService: ProjectsService, cacheService: CacheService);
    private normalizeText;
    private getNeighborhood;
    private getStreet;
    private buildCsv;
    private buildComparativeRows;
    marketOverview(tenantId: string, projectId?: string, focus?: string, filters?: MarketFilter): Promise<{}>;
    exportMarketCsv(tenantId: string, projectId?: string, focus?: string, filters?: MarketFilter): Promise<{
        fileName: string;
        contentType: string;
        csv: string;
        summary: any;
    }>;
}
export {};
