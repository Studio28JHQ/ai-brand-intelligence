import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import type { ApiErrorResponse } from '@ai-visibility/contracts';
import { logger } from '@ai-visibility/shared';

/**
 * `ValidationPipe`'s `BadRequestException` never puts the actual per-field validation messages in
 * `exception.message` (that stays the generic "Bad Request Exception") — they live in
 * `exception.getResponse()`'s `message` array instead. Without this, every DTO validation
 * failure across the whole API reached the client as a content-free "Bad Request Exception,"
 * masking exactly which field/rule failed (found while investigating `F9-S02-HF01`).
 */
function resolveClientMessage(exception: HttpException): string {
  const body = exception.getResponse();

  if (typeof body === 'string') {
    return body;
  }

  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) {
      return message.join('; ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  return exception.message;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const clientMessage = isHttpException ? resolveClientMessage(exception) : 'Internal server error';
    const code = isHttpException ? exception.constructor.name : 'INTERNAL_ERROR';

    // The client only ever sees `clientMessage` (safe: a resolved validation message, or the
    // generic "Internal server error" for anything unexpected) — but the server log always
    // records the real underlying error, stack included for non-HTTP exceptions, so an
    // unexpected failure is never invisible to whoever is operating the API.
    logger.error(isHttpException ? clientMessage : (exception as Error)?.message ?? String(exception), {
      correlationId: request.correlationId,
      method: request.method,
      path: request.originalUrl,
      statusCode: status,
      stack: isHttpException ? undefined : (exception as Error)?.stack,
    });

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message: clientMessage,
        correlationId: request.correlationId,
      },
    };

    response.status(status).json(body);
  }
}
