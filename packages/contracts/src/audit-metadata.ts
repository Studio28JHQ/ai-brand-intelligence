import type { AuditStatus } from './audit';
import type { VisibilityStatus } from './ai-visibility';
import type { WorkflowExecutionRecord } from './workflow-execution-history';

export interface AuditMetadata {
  id: string;
  projectId: string;
  url: string;
  status: AuditStatus;
  startedAt: string | null;
  completedAt: string | null;
  snapshotId: string | null;
  aiVisibilityStatus: VisibilityStatus | null;
  executionHistory: WorkflowExecutionRecord[];
}
