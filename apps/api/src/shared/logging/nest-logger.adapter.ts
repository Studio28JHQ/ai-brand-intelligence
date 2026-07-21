import { LoggerService } from '@nestjs/common';
import { logger } from '@ai-visibility/shared';

export class NestLoggerAdapter implements LoggerService {
  log(message: string, context?: string): void {
    logger.info(message, context ? { context } : undefined);
  }

  error(message: string, trace?: string, context?: string): void {
    logger.error(message, { trace, context });
  }

  warn(message: string, context?: string): void {
    logger.warn(message, context ? { context } : undefined);
  }

  debug(message: string, context?: string): void {
    logger.debug(message, context ? { context } : undefined);
  }

  verbose(message: string, context?: string): void {
    logger.debug(message, context ? { context } : undefined);
  }
}
