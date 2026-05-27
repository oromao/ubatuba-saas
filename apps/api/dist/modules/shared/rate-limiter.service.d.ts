import { RedisService } from './redis.service';
interface RateLimitTier {
    role: string;
    points: number;
    duration: number;
    description: string;
}
export declare class RateLimiterService {
    private readonly redisService;
    private limiters;
    private readonly logger;
    private redisAvailable;
    constructor(redisService: RedisService);
    private setup;
    consume(userId: string, role?: string, _points?: number): Promise<void>;
    private checkLimit;
    getTierInfo(role: string): RateLimitTier | undefined;
    getAllTiers(): RateLimitTier[];
    isRedisAvailable(): boolean;
    reset(userId: string, role?: string): Promise<void>;
}
export {};
