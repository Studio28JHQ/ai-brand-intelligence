import { Inject, Injectable } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '../../domain/campaign/campaign.repository';
import { Campaign } from '../../domain/campaign/campaign.entity';
import {
  OPTIMIZATION_ACTION_REPOSITORY,
  OptimizationActionRepository,
} from '../../domain/campaign/optimization-action.repository';
import { OptimizationAction } from '../../domain/campaign/optimization-action.entity';

export interface CampaignQueryResult {
  campaign: Campaign;
  actions: OptimizationAction[];
}

@Injectable()
export class CampaignQueryService {
  constructor(
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository,
    @Inject(OPTIMIZATION_ACTION_REPOSITORY) private readonly optimizationActionRepository: OptimizationActionRepository,
  ) {}

  async getById(id: string): Promise<CampaignQueryResult | null> {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) {
      return null;
    }
    const actions = await this.optimizationActionRepository.findByCampaignId(campaign.id);
    return { campaign, actions };
  }

  async getLatestByProjectId(projectId: string): Promise<CampaignQueryResult | null> {
    const campaign = await this.campaignRepository.findLatestByProjectId(projectId);
    if (!campaign) {
      return null;
    }
    const actions = await this.optimizationActionRepository.findByCampaignId(campaign.id);
    return { campaign, actions };
  }
}
