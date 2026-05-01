import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../shared/redis.service';

export interface ComponentHealth {
  status: 'ok' | 'degraded' | 'down';
  latencyMs?: number;
  error?: string;
}

export interface HealthResult {
  status: 'ok' | 'degraded' | 'down';
  components: Record<string, ComponentHealth>;
  uptimeSeconds: number;
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly redisService: RedisService,
  ) {}

  async check(): Promise<HealthResult> {
    const results: Record<string, ComponentHealth> = {};
    let overall: 'ok' | 'degraded' | 'down' = 'ok';

    // MongoDB
    const mongoStart = Date.now();
    const mongoOk = this.connection.readyState === 1;
    results.mongodb = {
      status: mongoOk ? 'ok' : 'down',
      latencyMs: Date.now() - mongoStart,
    };
    if (!mongoOk) overall = 'degraded';

    // Redis
    try {
      const redisStart = Date.now();
      const redisStatus = await this.redisService.status();
      results.redis = {
        status: redisStatus.status === 'connected' ? 'ok' : 'degraded',
        latencyMs: Date.now() - redisStart,
      };
      if (redisStatus.status !== 'connected') overall = 'degraded';
    } catch (e) {
      results.redis = { status: 'down', error: String(e) };
      overall = 'degraded';
    }

    const memUsage = process.memoryUsage();
    // Memory: only degraded if > 98%
    results.memory = {
      status: memUsage.heapUsed / memUsage.heapTotal > 0.98 ? 'degraded' : 'ok',
    };

    return {
      status: overall,
      components: results,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
