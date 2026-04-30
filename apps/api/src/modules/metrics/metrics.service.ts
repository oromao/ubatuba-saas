import { Injectable } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly httpRequestsTotal: Counter;
  private readonly httpRequestDurationMs: Histogram;
  private readonly errorsTotal: Counter;

  constructor() {
    collectDefaultMetrics({ register: this.registry, prefix: 'flydea_api_' });

    this.httpRequestsTotal = new Counter({
      name: 'flydea_http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDurationMs = new Histogram({
      name: 'flydea_http_request_duration_ms',
      help: 'HTTP request duration in ms',
      labelNames: ['method', 'path'],
      buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
      registers: [this.registry],
    });

    this.errorsTotal = new Counter({
      name: 'flydea_errors_total',
      help: 'Total errors',
      labelNames: ['type', 'path'],
      registers: [this.registry],
    });
  }

  recordRequest(method: string, path: string, status: number, durationMs: number) {
    this.httpRequestsTotal.labels(method, path, String(status)).inc();
    this.httpRequestDurationMs.labels(method, path).observe(durationMs);
    if (status >= 400) {
      this.errorsTotal.labels(status >= 500 ? 'server_error' : 'client_error', path).inc();
    }
  }

  async getMetrics() {
    return this.registry.metrics();
  }

  getContentType() {
    return this.registry.contentType;
  }
}

