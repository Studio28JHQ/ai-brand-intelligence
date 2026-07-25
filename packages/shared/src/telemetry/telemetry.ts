import type { TelemetryEvent, TelemetryEventCategory, TelemetryEventSeverity } from './telemetry-event';
import type { TelemetryEventPublisher } from './telemetry-event-publisher';
import { ConsoleTelemetryEventPublisher } from './console-telemetry-event-publisher';

let publisher: TelemetryEventPublisher = new ConsoleTelemetryEventPublisher();

export function setTelemetryPublisher(next: TelemetryEventPublisher): void {
  publisher = next;
}

export function getTelemetryPublisher(): TelemetryEventPublisher {
  return publisher;
}

export interface EmitTelemetryEventInput {
  name: string;
  category: TelemetryEventCategory;
  severity: TelemetryEventSeverity;
  correlationId: string;
  source: string;
  data?: Record<string, unknown>;
}

export function emitTelemetryEvent(input: EmitTelemetryEventInput): void {
  const event: TelemetryEvent = { ...input, timestamp: new Date().toISOString() };
  publisher.publish(event);
}
