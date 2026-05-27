"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = require("helmet");
const express_1 = require("express");
const crypto_1 = require("crypto");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logger_service_1 = require("./common/logger/logger.service");
const error_log_service_1 = require("./common/services/error-log.service");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), { prefix: '/uploads/' });
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
    const errorLogService = app.get(error_log_service_1.ErrorLogService);
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(logger, errorLogService));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('FlyDea SaaS API')
        .setDescription('Geo-Intelligence Municipal Platform — REURB, CTM, PGV')
        .setVersion('0.1.0')
        .setContact('FlyDea Support', 'https://flydea.dev', 'support@flydea.dev')
        .setLicense('Proprietary', 'https://flydea.dev/license')
        .addServer(`http://localhost:${process.env.PORT || 4000}`, 'Local Development')
        .addServer('https://api.staging.flydea.dev', 'Staging')
        .addServer('https://api.flydea.dev', 'Production')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token (15 min expiry)',
    }, 'access-token')
        .addApiKey({ type: 'apiKey', in: 'header', name: 'x-tenant-id' }, 'tenant-id')
        .addApiKey({ type: 'apiKey', in: 'header', name: 'x-correlation-id' }, 'correlation-id')
        .addTag('Auth', 'Authentication & Authorization')
        .addTag('Tenants', 'Multi-tenant management')
        .addTag('Projects', 'Project/workspace management')
        .addTag('REURB', 'Regularization (REURB-S) workflows')
        .addTag('CTM', 'Cadastral (Cadastro Territorial Multifinalitário)')
        .addTag('PGV', 'Property Valuation (Planta Genérica de Valores)')
        .addTag('Maps', 'Geospatial features & layers')
        .addTag('Surveys', 'Aerial & mobile survey management')
        .addTag('Compliance', 'Regulatory compliance tracking')
        .addTag('Health', 'System health & metrics')
        .build();
    const swaggerDoc = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, swaggerDoc, {
        swaggerOptions: {
            persistAuthorization: true,
            displayOperationId: true,
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            tagsSorter: 'alpha',
            operationsSorter: 'method',
        },
    });
    const port = process.env.PORT ? Number(process.env.PORT) : 4000;
    await app.listen(port);
    logger.log(`API started on port ${port}`);
    const shutdown = async (signal) => {
        logger.log(`Received ${signal}, shutting down gracefully...`);
        await app.close();
        process.exit(0);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('unhandledRejection', (reason) => {
        logger.error(`Unhandled Promise Rejection: ${String(reason)}`);
    });
    process.on('uncaughtException', (error) => {
        logger.error(`Uncaught Exception: ${error.message}\n${error.stack}`);
        process.exit(1);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map