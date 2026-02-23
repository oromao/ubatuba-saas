import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logHttpAll = String(process.env.LOG_HTTP_ALL ?? 'false') === 'true';
  private readonly logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    base: { service: 'flydea-api' },
  });

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error({ trace }, message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  info(message: string, payload?: Record<string, unknown>) {
    this.logger.info(payload ?? {}, message);
  }

  warnWithContext(message: string, payload?: Record<string, unknown>) {
    this.logger.warn(payload ?? {}, message);
  }

  errorWithContext(message: string, payload?: Record<string, unknown>) {
    this.logger.error(payload ?? {}, message);
  }

  logHttp(payload: {
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    correlationId?: string | null;
    tenantId?: string | null;
    userId?: string | null;
  }) {
    const shouldLog = this.logHttpAll || payload.statusCode >= 400;
    if (!shouldLog) return;
    const level = payload.statusCode >= 500 ? 'error' : payload.statusCode >= 400 ? 'warn' : 'info';
    this.logger[level]({ http: payload }, 'http_request');
  }
}
