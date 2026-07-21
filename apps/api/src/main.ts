import { NestFactory } from '@nestjs/core';
import { loadConfig } from '@ai-visibility/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const config = loadConfig();
  const app = await NestFactory.create(AppModule);
  await app.listen(config.PORT);
}

bootstrap();
