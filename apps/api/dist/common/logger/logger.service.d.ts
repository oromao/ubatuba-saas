import { LoggerService as NestLoggerService } from '@nestjs/common';
export declare class LoggerService implements NestLoggerService {
    private readonly logHttpAll;
    private readonly logger;
    log(message: string): void;
    error(message: string, trace?: string): void;
    warn(message: string): void;
    debug(message: string): void;
    info(message: string, payload?: Record<string, unknown>): void;
    warnWithContext(message: string, payload?: Record<string, unknown>): void;
    errorWithContext(message: string, payload?: Record<string, unknown>): void;
    logHttp(payload: {
        method: string;
        path: string;
        statusCode: number;
        durationMs: number;
        correlationId?: string | null;
        tenantId?: string | null;
        userId?: string | null;
    }): void;
}
