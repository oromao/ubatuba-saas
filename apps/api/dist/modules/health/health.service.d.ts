import { Connection } from 'mongoose';
import { RedisService } from '../shared/redis.service';
export declare class HealthService {
    private readonly connection;
    private readonly redisService;
    constructor(connection: Connection, redisService: RedisService);
    check(): Promise<{
        status: string;
        mongo: string;
        redis: string;
        timestamp: string;
    }>;
}
