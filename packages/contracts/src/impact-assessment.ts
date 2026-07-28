import type { CoverageLevel, VisibilityScoreTrend, VisibilityStatus } from './ai-visibility';
import type { FindingComparisonEntry } from './audit-comparison';

export type ImpactSummaryCategory = 'ai-visibility' | 'findings' | 'entity-coverage' | 'campaign-actions';

// No `description` here: `messageKey` (a `rules` i18n domain `templates.*` key) plus `parameters`
// is what the presentation layer resolves into a localized sentence — see
// `docs/04_PROJECT/DECISION_LOG.md#cto-111`.
export interface ImpactSummaryEntry {
  category: ImpactSummaryCategory;
  messageKey: string;
  parameters: Record<string, string | number>;
}

export interface CampaignActionsVerified {
  total: number;
  verified: number;
}

export interface ImpactAssessment {
  campaignId: string;
  projectId: string;
  cycleId: string;
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
