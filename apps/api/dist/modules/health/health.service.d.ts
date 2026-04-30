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
export declare class HealthService {
    private readonly connection;
    private readonly redisService;
    constructor(connection: Connection, redisService: RedisService);
    check(): Promise<HealthResult>;
}
