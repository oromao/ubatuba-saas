import { RedisService } from './redis.service';
export declare class CacheService {
    private readonly redisService;
    constructor(redisService: RedisService);
    private buildKey;
    hashQuery(query: Record<string, unknown>): string;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
    invalidateByPrefix(prefix: string): Promise<void>;
}
