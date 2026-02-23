import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheService } from '../shared/cache.service';
import { RedisService } from '../shared/redis.service';
import { AlertsController } from './alerts.controller';
import { AlertsRepository } from './alerts.repository';
import { AlertsService } from './alerts.service';
import { EnvironmentalAlert, EnvironmentalAlertSchema } from './alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnvironmentalAlert.name, schema: EnvironmentalAlertSchema },
    ]),
  ],
  controllers: [AlertsController],
  providers: [AlertsRepository, AlertsService, CacheService, RedisService],
  exports: [AlertsService],
})
export class AlertsModule {}
