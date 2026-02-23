import { Injectable, Logger } from '@nestjs/common';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisService } from './redis.service';

@Injectable()
export class RateLimiterService {
  private limiter: RateLimiterMemory | RateLimiterRedis;
  private readonly logger = new Logger('RateLimiter');

  constructor(private readonly redisService: RedisService) {
    this.limiter = new RateLimiterMemory({
      points: 10,
      duration: 60,
    });
    this.setup();
  }

  private async setup() {
    const client = await this.redisService.getClient();
    if (client) {
      this.limiter = new RateLimiterRedis({
        storeClient: client,
        points: 10,
        duration: 60,
      });
      this.logger.log('Rate limiter usando Redis');
    } else {
      this.logger.warn('Rate limiter usando memoria (Redis indisponivel)');
    }
  }

  async consume(key: string, points = 1) {
    await this.limiter.consume(key, points);
  }
}
