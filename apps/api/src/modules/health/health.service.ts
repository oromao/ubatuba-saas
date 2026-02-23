import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../shared/redis.service';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly redisService: RedisService,
  ) {}

  async check() {
    const mongoOk = this.connection.readyState === 1;
    const redis = await this.redisService.status();
    return {
      status: mongoOk ? 'ok' : 'degraded',
      mongo: mongoOk ? 'ok' : 'down',
      redis: redis.status,
      timestamp: new Date().toISOString(),
    };
  }
}
