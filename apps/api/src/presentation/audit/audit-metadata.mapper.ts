import type { AuditMetadata } from '@ai-visibility/contracts';
import { AuditQueryResult } from '../../application/audit/audit-query.service';

export function toAuditMetadata({ audit, aiVisibilityStatus, executionHistory }: AuditQueryResult): AuditMetadata {
  return {
    id: audit.id,
    projectId: audit.projectId,
    cycleId: audit.cycleId,
    url: audit.url,
    status: audit.status,
    startedAt: audit.startedAt ? audit.startedAt.toISOString() : null,
    completedAt: audit.completedAt ? audit.completedAt.toISOString() : null,
    snapshotId: audit.status === 'completed' ? audit.id : null,
    aiVisibilityStatus,
    executionHistory,
  };
}
