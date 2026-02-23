import { Injectable } from '@nestjs/common';
import { CacheService } from '../shared/cache.service';
import { ProcessesService } from '../processes/processes.service';
import { AlertsService } from '../alerts/alerts.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly processesService: ProcessesService,
    private readonly alertsService: AlertsService,
    private readonly assetsService: AssetsService,
    private readonly cacheService: CacheService,
  ) {}

  async getKpis(tenantId: string) {
    const cacheKey = `dashboard:${tenantId}:kpis`;
    const cached = await this.cacheService.get<unknown>(cacheKey);
    if (cached) return cached;

    const [processes, alerts, assets] = await Promise.all([
      this.processesService.list(tenantId),
      this.alertsService.list(tenantId),
      this.assetsService.list(tenantId),
    ]);

    const result = {
      processes: processes.length,
      alerts: alerts.length,
      assets: assets.length,
    };

    await this.cacheService.set(cacheKey, result, 60);
    return result;
  }
}
