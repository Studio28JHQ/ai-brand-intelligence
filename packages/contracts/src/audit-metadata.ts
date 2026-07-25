import type { AuditStatus } from './audit';
import type { VisibilityStatus } from './ai-visibility';

export interface AuditMetadata {
  id: string;
  url: string;
  status: AuditStatus;
  startedAt: string | null;
  completedAt: string | null;
  snapshotId: string | null;
  aiVisibilityStatus: VisibilityStatus | null;
}
