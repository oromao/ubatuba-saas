"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const express_1 = require("express");
const crypto_1 = require("crypto");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logger_service_1 = require("./common/logger/logger.service");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const logger = app.get(logger_service_1.LoggerService);
    app.useLogger(logger);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.length > 0
            ? process.env.CORS_ORIGIN.split(',')
            : '*',
        credentials: true,
    });
    app.use((0, express_1.json)({ limit: '10mb' }));
    app.use((req, res, next) => {
        const startedAt = Date.now();
        const incoming = req.header('x-correlation-id');
        const correlationId = incoming && incoming.trim().length > 0 ? incoming : (0, crypto_1.randomUUID)();
        req.correlationId = correlationId;
        res.setHeader('x-correlation-id', correlationId);
        res.on('finish', () => {
            const tenantId = req.header('x-tenant-id');
            const user = req.user;
            logger.logHttp({
                method: req.method,
                path: req.originalUrl || req.url,
                statusCode: res.statusCode,
                durationMs: Date.now() - startedAt,
                correlationId,
                tenantId: tenantId ?? null,
                userId: user?.sub ?? null,
            });
        });
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(logger));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('FlyDea API')
        .setDescription('API de geointeligencia municipal')
        .setVersion('0.1.0')
        .addBearerAuth()
        .build();
    const swaggerDoc = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, swaggerDoc);
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await app.listen(port);
    logger.log(`API started on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map