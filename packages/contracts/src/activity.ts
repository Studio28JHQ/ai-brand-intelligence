import type { AuditStatus } from './audit';

// The only operation type with a real, populated entry today is 'audit' — this platform's one
// genuinely asynchronous, long-running, background-executing workflow (F10-S04B/D). Optimization,
// Import, Export, and AI Analysis (the ticket's own examples) are all synchronous request/response
// operations with no "in progress" state to honestly track — see
// docs/04_PROJECT/DECISION_LOG.md#cto-107. The union stays real and extensible rather than a
// fabricated placeholder: a future genuinely-async operation type would add its own literal here
// and a real query path, exactly like 'audit' has.
export type OperationType = 'audit';

export interface ActiveOperationEntry {
  id: string;
  operationType: OperationType;
  projectId: string;
  projectName: string;
  // What this operation is actually doing — the Audit's target URL today.
  subject: string;
  status: AuditStatus;
  // Real, computed live from the same in-process publisher backing GET /audits/:id/events — never
  // fabricated. Null once terminal (nothing is "currently" happening anymore).
  currentStepLabel: string | null;
  progressPercent: number | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  // Real-data-derived (F10-S04D); both null unless status === 'queued'.
  queuePosition: number | null;
  estimatedStartAt: string | null;
  canCancel: boolean;
  canRetry: boolean;
}
