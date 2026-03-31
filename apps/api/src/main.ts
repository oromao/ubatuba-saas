import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json } from 'express';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerService } from './common/logger/logger.service';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.use(helmet());
  app.enableCors({
    origin:
      process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.length > 0
        ? process.env.CORS_ORIGIN.split(',')
        : '*',
    credentials: true,
  });
  app.use(json({ limit: '10mb' }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const incoming = req.header('x-correlation-id');
    const correlationId = incoming && incoming.trim().length > 0 ? incoming : randomUUID();
    (req as Request & { correlationId?: string }).correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    res.on('finish', () => {
      const tenantId = req.header('x-tenant-id');
      const user = (req as Request & { user?: { sub?: string } }).user;
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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger/OpenAPI Configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FlyDea SaaS API')
    .setDescription('Geo-Intelligence Municipal Platform — REURB, CTM, PGV')
    .setVersion('0.1.0')
    .setContact('FlyDea Support', 'https://flydea.dev', 'support@flydea.dev')
    .setLicense('Proprietary', 'https://flydea.dev/license')
    .addServer(`http://localhost:${process.env.PORT || 4000}`, 'Local Development')
    .addServer('https://api.staging.flydea.dev', 'Staging')
    .addServer('https://api.flydea.dev', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token (15 min expiry)',
      },
      'access-token',
    )
    .addApiKey({ type: 'header', name: 'x-tenant-id' }, 'tenant-id')
    .addApiKey({ type: 'header', name: 'x-correlation-id' }, 'correlation-id')
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
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDoc, {
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
}

bootstrap();
