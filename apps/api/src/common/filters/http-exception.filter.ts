import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string; tenantId?: string; user?: { sub?: string } }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const detail =
      exception instanceof HttpException
        ? exception.message
        : 'Erro interno';

    const title =
      exception instanceof HttpException
        ? HttpStatus[status]
        : 'Internal Server Error';

    const payload = {
      status,
      method: request.method,
      url: request.url,
      correlationId: request.correlationId ?? null,
      tenantId: request.tenantId ?? null,
      userId: request.user?.sub ?? null,
      detail,
    };
    if (status >= 500) {
      this.logger.errorWithContext('http_exception', {
        ...payload,
        trace: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      this.logger.warnWithContext('http_exception', payload);
    }

    response.status(status).json({
      type: 'about:blank',
      title,
      status,
      detail,
      instance: request.url,
      correlationId: request.correlationId ?? null,
    });
  }
}
