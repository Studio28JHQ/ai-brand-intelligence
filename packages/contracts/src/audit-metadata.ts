import type { AuditStatus } from './audit';

export interface AuditMetadata {
  id: string;
  url: string;
  status: AuditStatus;
  startedAt: string | null;
  completedAt: string | null;
  snapshotId: string | null;
}
