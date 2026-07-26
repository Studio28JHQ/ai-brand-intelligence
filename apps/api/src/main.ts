import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { loadConfig } from '@ai-visibility/config';
import { AppModule } from './app.module';
import { correlationIdMiddleware } from './shared/middleware/correlation-id.middleware';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { NestLoggerAdapter } from './shared/logging/nest-logger.adapter';

async function bootstrap() {
  const config = loadConfig();
  const app = await NestFactory.create(AppModule, {
    logger: new NestLoggerAdapter(),
  });

  app.use(correlationIdMiddleware);
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
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

bootstrap();
