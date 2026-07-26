export type CampaignStatus = 'draft' | 'active' | 'completed' | 'archived';

export type OptimizationActionStatus = 'pending' | 'in-progress' | 'completed' | 'verified';

export interface OptimizationActionMetadata {
  id: string;
  campaignId: string;
  projectId: string;
  auditId: string;
  title: string;
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
