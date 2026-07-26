import type { CampaignMetadata, OptimizationActionMetadata } from '@ai-visibility/contracts';
import { Campaign } from '../../domain/campaign/campaign.entity';
import { OptimizationAction } from '../../domain/campaign/optimization-action.entity';

function toActionMetadata(action: OptimizationAction): OptimizationActionMetadata {
  return {
    id: action.id,
    campaignId: action.campaignId,
    projectId: action.projectId,
    auditId: action.auditId,
    title: action.title,
    supportingFindingIds: [...action.supportingFindingIds],
    status: action.status,
    createdAt: action.createdAt.toISOString(),
    startedAt: action.startedAt ? action.startedAt.toISOString() : null,
    completedAt: action.completedAt ? action.completedAt.toISOString() : null,
    verifiedAt: action.verifiedAt ? action.verifiedAt.toISOString() : null,
  };
}

export function toCampaignMetadata(campaign: Campaign, actions: ReadonlyArray<OptimizationAction>): CampaignMetadata {
  return {
    id: campaign.id,
    projectId: campaign.projectId,
    sourceAuditId: campaign.sourceAuditId,
    status: campaign.status,
    createdAt: campaign.createdAt.toISOString(),
    activatedAt: campaign.activatedAt ? campaign.activatedAt.toISOString() : null,
    completedAt: campaign.completedAt ? campaign.completedAt.toISOString() : null,
    archivedAt: campaign.archivedAt ? campaign.archivedAt.toISOString() : null,
    actions: actions.map(toActionMetadata),
  };
}
