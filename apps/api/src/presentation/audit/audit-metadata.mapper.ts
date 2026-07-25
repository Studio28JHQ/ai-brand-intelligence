import type { AuditMetadata } from '@ai-visibility/contracts';
import { Audit } from '../../domain/audit/audit.entity';

export function toAuditMetadata(audit: Audit): AuditMetadata {
  return {
    id: audit.id,
    url: audit.url,
    status: audit.status,
    startedAt: audit.startedAt ? audit.startedAt.toISOString() : null,
    completedAt: audit.completedAt ? audit.completedAt.toISOString() : null,
    snapshotId: audit.status === 'completed' ? audit.id : null,
  };
}
