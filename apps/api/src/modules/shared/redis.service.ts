import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  private client: RedisClientType | null = null;

  async getClient() {
    if (!process.env.REDIS_URL) {
      return null;
    }
    if (!this.client) {
      this.client = createClient({ url: process.env.REDIS_URL });
      this.client.on('error', () => undefined);
      try {
        await this.client.connect();
      } catch {
        this.client = null;
      }
    }
    return this.client;
  }

  async status() {
    const client = await this.getClient();
    if (!client) {
      return { status: 'disabled' };
    }
    try {
      await client.ping();
      return { status: 'ok' };
    } catch {
      return { status: 'degraded' };
    }
  }
}
