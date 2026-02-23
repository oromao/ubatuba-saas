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
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("../logger/logger.service");
let HttpExceptionFilter = class HttpExceptionFilter {
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const detail = exception instanceof common_1.HttpException
            ? exception.message
            : 'Erro interno';
        const title = exception instanceof common_1.HttpException
            ? common_1.HttpStatus[status]
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
        }
        else {
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
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [logger_service_1.LoggerService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map