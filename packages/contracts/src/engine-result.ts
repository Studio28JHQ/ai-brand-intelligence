export type EngineExecutionStatus = 'success' | 'failure';

export interface EngineError {
  name: string;
  message: string;
}

export interface EngineResult<TOutput = unknown> {
  engine: string;
  status: EngineExecutionStatus;
  output?: TOutput;
  error?: EngineError;
  metadata?: Record<string, unknown>;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  metrics?: Record<string, number>;
}
