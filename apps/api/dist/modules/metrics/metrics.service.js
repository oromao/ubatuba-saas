"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let MetricsService = class MetricsService {
    constructor() {
        this.registry = new prom_client_1.Registry();
        (0, prom_client_1.collectDefaultMetrics)({ register: this.registry, prefix: 'flydea_api_' });
        this.httpRequestsTotal = new prom_client_1.Counter({
            name: 'flydea_http_requests_total',
            help: 'Total HTTP requests',
            labelNames: ['method', 'path', 'status'],
            registers: [this.registry],
        });
        this.httpRequestDurationMs = new prom_client_1.Histogram({
            name: 'flydea_http_request_duration_ms',
            help: 'HTTP request duration in ms',
            labelNames: ['method', 'path'],
            buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
            registers: [this.registry],
        });
        this.errorsTotal = new prom_client_1.Counter({
            name: 'flydea_errors_total',
            help: 'Total errors',
            labelNames: ['type', 'path'],
            registers: [this.registry],
        });
    }
    recordRequest(method, path, status, durationMs) {
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
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map