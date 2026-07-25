import type { TelemetryEvent } from './telemetry-event';

export interface TelemetryEventPublisher {
  publish(event: TelemetryEvent): void;
}
