import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import type { ApiErrorResponse } from '@ai-visibility/contracts';
import { logger } from '@ai-visibility/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttpException ? exception.message : 'Internal server error';
    const code = isHttpException ? exception.constructor.name : 'INTERNAL_ERROR';

    logger.error(message, {
      correlationId: request.correlationId,
      method: request.method,
      path: request.originalUrl,
      statusCode: status,
    });

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        correlationId: request.correlationId,
      },
    };

    response.status(status).json(body);
  }
}
