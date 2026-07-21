import { NextFunction, Request, Response } from 'express';
import { CORRELATION_ID_HEADER, generateCorrelationId } from '@ai-visibility/shared';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(CORRELATION_ID_HEADER);
  const correlationId = incoming && incoming.length > 0 ? incoming : generateCorrelationId();

  req.correlationId = correlationId;
  res.setHeader(CORRELATION_ID_HEADER, correlationId);
  next();
}
