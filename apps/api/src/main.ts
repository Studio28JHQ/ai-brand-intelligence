import compression = require('compression');
import { default as helmet } from 'helmet';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { assertProductionSecrets, loadConfig } from '@ai-visibility/config';
import { logger, setLogLevel } from '@ai-visibility/shared';
import { AppModule } from './app.module';
import { correlationIdMiddleware } from './shared/middleware/correlation-id.middleware';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './shared/interceptors/timeout.interceptor';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { NestLoggerAdapter } from './shared/logging/nest-logger.adapter';

async function bootstrap() {
  const config = loadConfig();
  assertProductionSecrets(config);
  setLogLevel(config.LOG_LEVEL ?? (config.NODE_ENV === 'production' ? 'info' : 'debug'));

  const app = await NestFactory.create(AppModule, {
    logger: new NestLoggerAdapter(),
  });

  // Behind a reverse proxy/load balancer in production, this is required for req.ip and rate
  // limiting to see the real client address instead of the proxy's.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: config.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  });

  app.use(correlationIdMiddleware);
  app.useGlobalInterceptors(new LoggingInterceptor(), new TimeoutInterceptor(config.REQUEST_TIMEOUT_MS));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableShutdownHooks();

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('AI Visibility Auditor API')
      .setDescription('HTTP API for the AI Visibility Auditor platform.')
      .setVersion('0.0.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(config.PORT);
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason instanceof Error ? reason.stack : String(reason) });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { stack: error.stack });
  process.exit(1);
});

bootstrap().catch((error) => {
  logger.error('Fatal error during bootstrap', { stack: error instanceof Error ? error.stack : String(error) });
  process.exit(1);
});
