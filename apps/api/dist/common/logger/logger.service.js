"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const pino_1 = require("pino");
let LoggerService = class LoggerService {
    constructor() {
        this.logHttpAll = String(process.env.LOG_HTTP_ALL ?? 'false') === 'true';
        this.logger = (0, pino_1.default)({
            level: process.env.LOG_LEVEL ?? 'info',
            base: { service: 'flydea-api' },
        });
    }
    log(message) {
        this.logger.info(message);
    }
    error(message, trace) {
        this.logger.error({ trace }, message);
    }
    warn(message) {
        this.logger.warn(message);
    }
    debug(message) {
        this.logger.debug(message);
    }
    info(message, payload) {
        this.logger.info(payload ?? {}, message);
    }
    warnWithContext(message, payload) {
        this.logger.warn(payload ?? {}, message);
    }
    errorWithContext(message, payload) {
        this.logger.error(payload ?? {}, message);
    }
    logHttp(payload) {
        const shouldLog = this.logHttpAll || payload.statusCode >= 400;
        if (!shouldLog)
            return;
        const level = payload.statusCode >= 500 ? 'error' : payload.statusCode >= 400 ? 'warn' : 'info';
        this.logger[level]({ http: payload }, 'http_request');
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)()
], LoggerService);
//# sourceMappingURL=logger.service.js.map