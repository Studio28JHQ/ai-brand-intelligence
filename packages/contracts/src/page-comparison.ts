import type { AuditStatus } from './audit';
import type { OptimizationItem } from './optimization-plan';

// One row per Audit for a given Page (URL) within a Project — real Audit history, sorted newest
// first, used to populate a "compare which two Audits?" picker.
export interface PageAuditHistoryEntry {
  auditId: string;
  status: AuditStatus;
  createdAt: string;
  completedAt: string | null;
}

export type ScoreTrend = 'improved' | 'declined' | 'unchanged' | 'unknown';

// 'category' is 'overall' for the whole-Page row, or one of the six Scores category keys
// ('seo', 'aiVisibility', 'technical', 'content', 'accessibility', 'performance') otherwise.
// `delta`/`trend` are only ever computed from two real, non-null scores — 'unknown' (never a
// fabricated 0) whenever either side has no real score to compare (`CategoryScoreStatus:
// 'insufficient-data'`, F10-S02B).
export interface CategoryScoreComparison {
  category: string;
  oldScore: number | null;
  newScore: number | null;
  delta: number | null;
  trend: ScoreTrend;
}

// A Finding's real ruleId/category, with its human title resolved from the same Optimization
// Knowledge Base every other Score/Recommendation surface already uses — never a fabricated label.
export interface PageComparisonIssue {
  ruleId: string;
  ruleVersion: string;
  category: string;
  title: string;
}

export interface PageComparisonResult {
  url: string;
  baselineAuditId: string;
  targetAuditId: string;
  baselineAuditAt: string | null;
  targetAuditAt: string | null;
  scores: CategoryScoreComparison[];
  newIssues: PageComparisonIssue[];
  resolvedIssues: PageComparisonIssue[];
  persistentIssues: PageComparisonIssue[];
  recommendations: OptimizationItem[];
}
