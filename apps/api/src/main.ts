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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FlyDea API')
    .setDescription('API de geointeligencia municipal')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDoc);

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  logger.log(`API started on port ${port}`);
}

bootstrap();
