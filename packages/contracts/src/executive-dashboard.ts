import type { VisibilityScoreTrend, VisibilityStatus } from './ai-visibility';
import type { AuditStatus } from './audit';
import type { OptimizationItem } from './optimization-plan';
import type { CampaignProgressSummary } from './optimization-campaign';
import type { ImpactAssessmentSummary } from './impact-assessment';

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
  campaign: CampaignProgressSummary | null;
  campaignImpact: ImpactAssessmentSummary | null;
}
