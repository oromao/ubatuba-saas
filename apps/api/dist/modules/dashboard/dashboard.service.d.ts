import { CacheService } from '../shared/cache.service';
import { ProcessesService } from '../processes/processes.service';
import { AlertsService } from '../alerts/alerts.service';
import { AssetsService } from '../assets/assets.service';
export declare class DashboardService {
    private readonly processesService;
    private readonly alertsService;
    private readonly assetsService;
    private readonly cacheService;
    constructor(processesService: ProcessesService, alertsService: AlertsService, assetsService: AssetsService, cacheService: CacheService);
    getKpis(tenantId: string): Promise<{}>;
}
