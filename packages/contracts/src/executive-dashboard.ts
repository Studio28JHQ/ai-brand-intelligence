import type { VisibilityStatus } from './ai-visibility';
import type { AuditStatus } from './audit';
import type { RecommendationPriority } from './recommendation';

export type VisibilityScoreTrend = 'improved' | 'declined' | 'unchanged' | 'unknown';

export type EffortLevel = 'low' | 'medium' | 'high';

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

export interface DashboardPriorityAction {
  title: string;
  rationale: string;
  priority: RecommendationPriority;
  estimatedEffort: EffortLevel;
  expectedImprovement: EffortLevel;
  relatedFindingIds: string[];
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
  priorityActions: DashboardPriorityAction[];
  recentActivity: DashboardRecentActivity;
}
