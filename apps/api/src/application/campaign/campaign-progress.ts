import type { CampaignProgressSummary } from '@ai-visibility/contracts';
import { Campaign } from '../../domain/campaign/campaign.entity';
import { OptimizationAction } from '../../domain/campaign/optimization-action.entity';

export function computeCampaignProgress(campaign: Campaign, actions: ReadonlyArray<OptimizationAction>): CampaignProgressSummary {
  const totalActions = actions.length;
  const pendingActions = actions.filter((action) => action.status === 'pending').length;
  const inProgressActions = actions.filter((action) => action.status === 'in-progress').length;
  const completedActions = actions.filter((action) => action.status === 'completed').length;
  const verifiedActions = actions.filter((action) => action.status === 'verified').length;

  return {
    campaignId: campaign.id,
    status: campaign.status,
    totalActions,
    pendingActions,
    inProgressActions,
    completedActions,
    verifiedActions,
    progressPercentage: totalActions === 0 ? 0 : Math.round((verifiedActions / totalActions) * 100),
  };
}
