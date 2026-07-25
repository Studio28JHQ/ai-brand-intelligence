import type { EngineExecutionStatus } from './engine-result';

export interface WorkflowProgress {
  stepId: string;
  status: EngineExecutionStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
}
