import type { AuditStatus } from './audit';

// One row of the Audit History screen (F10-S04C). Deliberately a separate type from
// AuditMetadata (used by Page Detail and other lightweight single-Audit reads) rather than adding
// these heavier, list-wide-computed fields onto it — overallScore in particular requires a real
// per-Audit Finding/Heuristic/Signal fetch, not something every AuditMetadata consumer should pay
// for. See docs/04_PROJECT/DECISION_LOG.md#cto-105.
export interface AuditHistoryEntry {
  id: string;
  projectId: string;
  projectName: string;
  url: string;
  status: AuditStatus;
  createdAt: string;
  startedAt: string | null;
  // Whichever of completedAt/failedAt/cancelledAt is actually set — a single "when did this Audit
  // stop running" timestamp, since AuditMetadata's completedAt alone is null for failed Audits.
  finishedAt: string | null;
  durationMs: number | null;
  // Real, computed on read from this Audit's Findings/Heuristics/Signals — null (not 0) when the
  // Audit never produced a real Score (not yet completed, or completed with zero evaluated Rules).
  overallScore: number | null;
  // The real UI surface that started this Audit ('dashboard' | 'project-overview' |
  // 'audit-history' | 'projects-page' | 'onboarding') — null for any Audit created before this
  // column existed, or via a direct API call outside the tracked UI surfaces. Not a user identity:
  // apps/api has no session/auth guard on this route today.
  triggeredBy: string | null;
  // Always 'Full Audit' today — only FULL_AUDIT_TYPE exists (see CTO-103's "Quick Audit" gap).
  auditType: string;
  isBaseline: boolean;
  // Real-data-derived (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106); both null unless
  // `status === 'queued'`.
  queuePosition: number | null;
  estimatedStartAt: string | null;
}
