import type { AuditStatus } from './audit';
import type { VisibilityStatus } from './ai-visibility';
import type { WorkflowExecutionRecord } from './workflow-execution-history';

export interface AuditMetadata {
  id: string;
  projectId: string;
  cycleId: string;
  url: string;
  status: AuditStatus;
  startedAt: string | null;
  completedAt: string | null;
  snapshotId: string | null;
  aiVisibilityStatus: VisibilityStatus | null;
  executionHistory: WorkflowExecutionRecord[];
  // Real-data-derived (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106); all null unless
  // `status === 'queued'`. See AuditQueryService.computeQueueInfo for exactly how each is computed.
  queuePosition: number | null;
  estimatedStartAt: string | null;
  // The most recent other completed Audit of the same Project+URL requested before this one, for
  // "Compare With Previous" — null if this is the first Audit of this URL.
  previousAuditId: string | null;
}
