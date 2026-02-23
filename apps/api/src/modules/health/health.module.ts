import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { RedisService } from '../../modules/shared/redis.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService, RedisService],
})
export class HealthModule {}
