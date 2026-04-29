import { RedisClientType } from 'redis';
export declare class RedisService {
    private client;
    getClient(): Promise<RedisClientType | null>;
    status(): Promise<{
        status: string;
    }>;
}
