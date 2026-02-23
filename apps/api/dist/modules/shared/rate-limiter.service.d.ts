import { RedisService } from './redis.service';
export declare class RateLimiterService {
    private readonly redisService;
    private limiter;
    private readonly logger;
    constructor(redisService: RedisService);
    private setup;
    consume(key: string, points?: number): Promise<void>;
}
