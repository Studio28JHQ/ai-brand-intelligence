export type TelemetryEventCategory = 'audit' | 'workflow' | 'engine' | 'system';

export type TelemetryEventSeverity = 'debug' | 'info' | 'warn' | 'error';

export interface TelemetryEvent {
  name: string;
  category: TelemetryEventCategory;
  severity: TelemetryEventSeverity;
  correlationId: string;
  source: string;
  timestamp: string;
  data?: Record<string, unknown>;
}
