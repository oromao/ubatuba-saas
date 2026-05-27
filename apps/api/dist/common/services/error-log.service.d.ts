import { Model } from 'mongoose';
import { ErrorLogDocument } from '../schemas/error-log.schema';
export declare class ErrorLogService {
    private readonly model;
    constructor(model: Model<ErrorLogDocument>);
    log(entry: {
        status: number;
        method: string;
        url: string;
        detail?: string;
        trace?: string;
        errorCode?: string;
        tenantId?: string;
        userId?: string;
        correlationId?: string;
    }): Promise<void>;
    list(filters?: {
        status?: number;
        unresolved?: boolean;
        limit?: number;
        tenantId?: string;
    }): Promise<ErrorLogDocument[]>;
    countUnresolved(): Promise<number>;
    markResolved(id: string, by?: string): Promise<void>;
    getStats(hours?: number): Promise<{
        total: number;
        serverErrors: number;
        clientErrors: number;
        unresolved: number;
        topEndpoints: Array<{
            url: string;
            count: number;
        }>;
    }>;
}
