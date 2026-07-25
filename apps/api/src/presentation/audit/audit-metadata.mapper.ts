import type { AuditMetadata } from '@ai-visibility/contracts';
import { AuditQueryResult } from '../../application/audit/audit-query.service';

export function toAuditMetadata({ audit, aiVisibilityStatus }: AuditQueryResult): AuditMetadata {
  return {
    id: audit.id,
    url: audit.url,
    status: audit.status,
    startedAt: audit.startedAt ? audit.startedAt.toISOString() : null,
    completedAt: audit.completedAt ? audit.completedAt.toISOString() : null,
    snapshotId: audit.status === 'completed' ? audit.id : null,
    aiVisibilityStatus,
  };
}
