import compression = require('compression');
import { default as helmet } from 'helmet';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { assertEmailProviderConfigured, assertProductionSecrets, loadConfig } from '@ai-visibility/config';
import { logger, setLogLevel } from '@ai-visibility/shared';
import { AppModule } from './app.module';
import { correlationIdMiddleware } from './shared/middleware/correlation-id.middleware';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './shared/interceptors/timeout.interceptor';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { NestLoggerAdapter } from './shared/logging/nest-logger.adapter';
import { buildAiProviderSettings } from './application/ai-provider/build-ai-provider-settings';

function logAiProviderSummary(config: ReturnType<typeof loadConfig>): void {
  const settings = buildAiProviderSettings(config);
  const lines = settings.map((provider) =>
    provider.hasApiKey ? `  ✓ ${provider.label}` : `  ✗ ${provider.label} (missing API key)`,
  );
  logger.info(`AI Providers\n${lines.join('\n')}`);
}

async function bootstrap() {
  const config = loadConfig();
  assertProductionSecrets(config);
  assertEmailProviderConfigured(config);
  setLogLevel(config.LOG_LEVEL ?? (config.NODE_ENV === 'production' ? 'info' : 'debug'));

  if (config.EMAIL_PROVIDER === 'console') {
    logger.warn(
      'Email delivery: EMAIL_PROVIDER=console — verification/OTP/password-reset emails will be logged, not delivered. ' +
        'Set EMAIL_PROVIDER=resend and RESEND_API_KEY to send real email (see docs/04_PROJECT/AUTHENTICATION.md).',
    );
  } else {
    logger.info(`Email delivery: using ${config.EMAIL_PROVIDER}`, {
      from: config.EMAIL_FROM,
      replyTo: config.EMAIL_REPLY_TO ?? '(none configured)',
    });
  }

  // Startup validation only — never fails the process. A missing provider is expected and normal;
  // this is purely visibility into which providers a Test Connection call would actually reach
  // (`F10-S01`, see `docs/04_PROJECT/DECISION_LOG.md#cto-094`).
  logAiProviderSummary(config);

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
