import { Module } from '@nestjs/common';
import { CtmModule } from '../ctm/ctm.module';
import { PgvModule } from '../pgv/pgv.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { ProjectsModule } from '../projects/projects.module';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { ObservatoryController } from './observatory.controller';
import { ObservatoryService } from './observatory.service';

@Module({
  imports: [ProjectsModule, CtmModule, PgvModule, MonitoringModule],
  controllers: [ObservatoryController],
  providers: [ObservatoryService, CacheService, RedisService],
})
export class ObservatoryModule {}
