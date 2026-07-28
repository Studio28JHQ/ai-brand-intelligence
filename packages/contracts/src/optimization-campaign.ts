export type CampaignStatus = 'draft' | 'active' | 'completed' | 'archived';

export type OptimizationActionStatus = 'pending' | 'in-progress' | 'completed' | 'verified';

// No `title` here: `optimizationRuleId`/`optimizationRuleVersion` is the stable semantic identifier
// the presentation layer resolves into a localized title via the `rules` i18n domain
// (`catalog.<optimizationRuleId>.title`) — see `docs/04_PROJECT/DECISION_LOG.md#cto-111`.
export interface OptimizationActionMetadata {
  id: string;
  campaignId: string;
  projectId: string;
  auditId: string;
  optimizationRuleId: string;
  optimizationRuleVersion: string;
  supportingFindingIds: string[];
  status: OptimizationActionStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  verifiedAt: string | null;
}

export interface CampaignMetadata {
  id: string;
  projectId: string;
  cycleId: string;
  sourceAuditId: string;
  status: CampaignStatus;
  createdAt: string;
  activatedAt: string | null;
  completedAt: string | null;
  archivedAt: string | null;
  actions: OptimizationActionMetadata[];
}

export interface CampaignProgressSummary {
  campaignId: string;
  status: CampaignStatus;
  totalActions: number;
  pendingActions: number;
  inProgressActions: number;
  completedActions: number;
  verifiedActions: number;
  progressPercentage: number;
}
