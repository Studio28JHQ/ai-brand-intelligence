import type { VisibilityStatus } from './ai-visibility';
import type { AuditStatus } from './audit';
import type { OptimizationItem } from './optimization-plan';

export type VisibilityScoreTrend = 'improved' | 'declined' | 'unchanged' | 'unknown';

export interface DashboardProjectOverview {
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  primaryDomain: string;
  canonicalWebsite: string;
  baselineAuditId: string | null;
  baselineSetAt: string | null;
  latestAuditId: string | null;
}

export interface DashboardVisibilityOverview {
  currentScore: VisibilityStatus | null;
  baselineScore: VisibilityStatus | null;
  scoreTrend: VisibilityScoreTrend;
  totalFindings: number;
  criticalFindings: number;
  opportunities: number;
}

export interface DashboardRecentActivity {
  latestCompletedAuditId: string | null;
  latestCompletedAuditDate: string | null;
  lastBaselineChangeAuditId: string | null;
  lastBaselineChangeAt: string | null;
  lastExecutionStatus: AuditStatus | null;
  lastExecutionAt: string | null;
}

export interface ExecutiveDashboard {
  project: DashboardProjectOverview;
  visibility: DashboardVisibilityOverview;
  priorityActions: OptimizationItem[];
  recentActivity: DashboardRecentActivity;
}
