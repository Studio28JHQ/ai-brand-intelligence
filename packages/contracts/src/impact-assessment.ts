import type { CoverageLevel, VisibilityScoreTrend, VisibilityStatus } from './ai-visibility';
import type { FindingComparisonEntry } from './audit-comparison';

export type ImpactSummaryCategory = 'ai-visibility' | 'findings' | 'entity-coverage' | 'campaign-actions';

export interface ImpactSummaryEntry {
  category: ImpactSummaryCategory;
  description: string;
}

export interface CampaignActionsVerified {
  total: number;
  verified: number;
}

export interface ImpactAssessment {
  campaignId: string;
  projectId: string;
  baselineAuditId: string;
  verificationAuditId: string;
  verificationDate: string;
  aiVisibilityChange: {
    baselineStatus: VisibilityStatus;
    verificationStatus: VisibilityStatus;
    trend: VisibilityScoreTrend;
  };
  entityCoverageChange: {
    baseline: CoverageLevel;
    verification: CoverageLevel;
  };
  findingsResolvedCount: number;
  findingsIntroducedCount: number;
  campaignActionsVerified: CampaignActionsVerified;
  improvements: ImpactSummaryEntry[];
  regressions: ImpactSummaryEntry[];
  remainingOpportunities: FindingComparisonEntry[];
}

export interface ImpactAssessmentSummary {
  campaignId: string;
  verificationDate: string;
  aiVisibilityTrend: VisibilityScoreTrend;
  findingsResolvedCount: number;
  findingsIntroducedCount: number;
  improvements: ImpactSummaryEntry[];
  remainingOpportunitiesCount: number;
}
