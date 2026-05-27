import { ErrorLogService } from '../../common/services/error-log.service';
export declare class ErrorLogController {
    private readonly service;
    constructor(service: ErrorLogService);
    listErrors(status?: string, unresolved?: string, limit?: string): Promise<{
        entries: import("../../common/schemas/error-log.schema").ErrorLogDocument[];
        unresolvedCount: number;
        total: number;
    }>;
    getStats(hours?: string): Promise<{
        total: number;
        serverErrors: number;
        clientErrors: number;
        unresolved: number;
        topEndpoints: Array<{
            url: string;
            count: number;
        }>;
    }>;
    resolveError(id: string): Promise<{
        resolved: boolean;
    }>;
}
