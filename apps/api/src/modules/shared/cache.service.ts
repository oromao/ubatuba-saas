import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  private buildKey(key: string) {
    return `flydea:${key}`;
  }

  hashQuery(query: Record<string, unknown>) {
    const payload = JSON.stringify(query);
    return createHash('sha256').update(payload).digest('hex').slice(0, 16);
  }

  async get<T>(key: string): Promise<T | null> {
    const client = await this.redisService.getClient();
    if (!client) return null;
    try {
      const value = await client.get(this.buildKey(key));
      return value ? (JSON.parse(value) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number) {
    const client = await this.redisService.getClient();
    if (!client) return;
    try {
      await client.set(this.buildKey(key), JSON.stringify(value), {
        EX: ttlSeconds,
      });
    } catch {
      return;
    }
  }

  async invalidateByPrefix(prefix: string) {
    const client = await this.redisService.getClient();
    if (!client) return;
    const pattern = this.buildKey(`${prefix}*`);
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  }
}
