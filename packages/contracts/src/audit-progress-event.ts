import type { AuditStatus } from './audit';

export type AuditStageStatus = 'waiting' | 'running' | 'completed' | 'failed';

export interface AuditStepProgressEvent {
  type: 'step';
  stepId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface AuditLifecycleProgressEvent {
  type: 'audit';
  status: AuditStatus;
  timestamp: string;
}

export type AuditProgressEvent = AuditStepProgressEvent | AuditLifecycleProgressEvent;
