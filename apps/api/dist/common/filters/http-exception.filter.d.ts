import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ErrorLogService } from '../services/error-log.service';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger;
    private readonly errorLogService?;
    constructor(logger: LoggerService, errorLogService?: ErrorLogService | undefined);
    catch(exception: unknown, host: ArgumentsHost): void;
}
