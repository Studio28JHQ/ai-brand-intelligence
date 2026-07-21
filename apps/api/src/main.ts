import { NestFactory } from '@nestjs/core';
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

  await app.listen(config.PORT);
}

bootstrap();
