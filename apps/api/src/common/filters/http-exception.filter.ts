import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { ErrorLogService } from '../services/error-log.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly errorLogService?: ErrorLogService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string; tenantId?: string; user?: { sub?: string } }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;

    const detail =
      typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
        ? (Array.isArray((exceptionResponse as { message?: unknown }).message)
          ? (exceptionResponse as { message: unknown[] }).message.join('; ')
          : String((exceptionResponse as { message?: unknown }).message ?? 'Erro de validacao'))
        : exception instanceof HttpException
          ? exception.message
          : exception instanceof Error
          ? exception.message
          : 'Erro interno';

    const title =
      exception instanceof HttpException
        ? HttpStatus[status]
        : 'Internal Server Error';

    let errorCode = 'INTERNAL_ERROR';
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'error' in exceptionResponse) {
      errorCode = String((exceptionResponse as { error?: unknown }).error);
    } else if (exception instanceof HttpException) {
      errorCode = `HTTP_${status}`;
    } else if (exception instanceof SyntaxError) {
      errorCode = 'PARSE_ERROR';
    } else if (exception instanceof TypeError) {
      errorCode = 'TYPE_ERROR';
    }

    const payload = {
      status,
      method: request.method,
      url: request.url,
      correlationId: request.correlationId ?? null,
      tenantId: request.tenantId ?? null,
      userId: request.user?.sub ?? null,
      detail,
    };

    // Persist errors to MongoDB (self-hosted error monitoring, 100% free)
    if (this.errorLogService && status >= 400) {
      this.errorLogService.log({
        status,
        method: request.method,
        url: request.url,
        detail,
        trace: status >= 500 && exception instanceof Error ? exception.stack : undefined,
        errorCode,
        tenantId: request.tenantId ?? undefined,
        userId: request.user?.sub ?? undefined,
        correlationId: request.correlationId ?? undefined,
      }).catch(() => {});
    }

    if (status >= 500) {
      this.logger.errorWithContext('http_exception', {
        ...payload,
        trace: exception instanceof Error ? exception.stack : undefined,
      });
    } else {
      this.logger.warnWithContext('http_exception', payload);
    }

    const extra =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? Object.fromEntries(
            Object.entries(exceptionResponse as Record<string, unknown>).filter(
              ([key]) => !['statusCode', 'message', 'error'].includes(key),
            ),
          )
        : {};

    response.status(status).json({
      type: 'about:blank',
      title,
      status,
      detail,
      code: errorCode,
      instance: request.url,
      correlationId: request.correlationId ?? null,
      ...extra,
    });
  }
}
