import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { ProcessesModule } from '../processes/processes.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AssetsModule } from '../assets/assets.module';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';

@Module({
  imports: [ProcessesModule, AlertsModule, AssetsModule],
  controllers: [DashboardController],
  providers: [DashboardService, CacheService, RedisService],
})
export class DashboardModule {}
