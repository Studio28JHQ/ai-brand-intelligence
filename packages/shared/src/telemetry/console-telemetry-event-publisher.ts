import { logger } from '../logger';
import type { TelemetryEvent } from './telemetry-event';
import type { TelemetryEventPublisher } from './telemetry-event-publisher';

export class ConsoleTelemetryEventPublisher implements TelemetryEventPublisher {
  publish(event: TelemetryEvent): void {
    const context = {
      correlationId: event.correlationId,
      category: event.category,
      source: event.source,
      ...event.data,
    };

    if (event.severity === 'error') {
      logger.error(event.name, context);
    } else if (event.severity === 'warn') {
      logger.warn(event.name, context);
    } else if (event.severity === 'debug') {
      logger.debug(event.name, context);
    } else {
      logger.info(event.name, context);
    }
  }
}
