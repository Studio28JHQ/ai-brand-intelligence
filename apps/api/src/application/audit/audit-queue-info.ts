import { Audit } from '../../domain/audit/audit.entity';

export interface AuditQueueInfo {
  queuePosition: number | null;
  estimatedStartAt: string | null;
}

// Shared by AuditQueryService (single-Audit reads) and AuditHistoryQueryService (the list screen)
// so "Queue Position"/"Estimated Start" (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106)
// are computed identically everywhere they're shown. Real-data-derived, never fabricated: both
// null unless `audit.status === 'queued'`.
export function computeQueueInfo(audit: Audit, allAudits: Audit[]): AuditQueueInfo {
  if (audit.status !== 'queued') {
    return { queuePosition: null, estimatedStartAt: null };
  }

  const queuedForProject = allAudits
    .filter((candidate) => candidate.projectId === audit.projectId && candidate.status === 'queued')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const position = queuedForProject.findIndex((candidate) => candidate.id === audit.id) + 1;

  const averageDurationMs =
    averageCompletedDurationMs(allAudits.filter((candidate) => candidate.projectId === audit.projectId)) ??
    averageCompletedDurationMs(allAudits);

  if (averageDurationMs === null) {
    return { queuePosition: position, estimatedStartAt: null };
  }

  const runningAudit = allAudits.find(
    (candidate) => candidate.projectId === audit.projectId && candidate.status === 'running' && candidate.startedAt,
  );
  const remainingForRunningMs = runningAudit
    ? Math.max(0, averageDurationMs - (Date.now() - runningAudit.startedAt!.getTime()))
    : 0;

  const estimatedStartAt = new Date(Date.now() + remainingForRunningMs + (position - 1) * averageDurationMs).toISOString();
  return { queuePosition: position, estimatedStartAt };
}

function averageCompletedDurationMs(audits: Audit[]): number | null {
  const durations = audits
    .filter((candidate) => candidate.status === 'completed' && candidate.startedAt && candidate.completedAt)
    .map((candidate) => candidate.completedAt!.getTime() - candidate.startedAt!.getTime());
  if (durations.length === 0) {
    return null;
  }
  return durations.reduce((sum, value) => sum + value, 0) / durations.length;
}
