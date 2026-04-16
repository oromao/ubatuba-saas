import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AlertsModule } from '../alerts/alerts.module';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { EnvironmentalEvent, EnvironmentalEventSchema } from './environment-event.schema';
import { MonitoringController } from './monitoring.controller';
import { MonitoringRepository } from './monitoring.repository';
import { MonitoringService } from './monitoring.service';

@Module({
  imports: [
    AlertsModule,
    MongooseModule.forFeature([{ name: EnvironmentalEvent.name, schema: EnvironmentalEventSchema }]),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringRepository, MonitoringService, CacheService, RedisService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
