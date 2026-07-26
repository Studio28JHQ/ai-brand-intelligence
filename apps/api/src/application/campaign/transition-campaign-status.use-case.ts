import { Inject, Injectable } from '@nestjs/common';
import { Campaign } from '../../domain/campaign/campaign.entity';
import { CAMPAIGN_REPOSITORY, CampaignRepository } from '../../domain/campaign/campaign.repository';

@Injectable()
export class TransitionCampaignStatusUseCase {
  constructor(@Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: CampaignRepository) {}

  async activate(id: string): Promise<Campaign> {
    return this.campaignRepository.activate(id, new Date());
  }

  async complete(id: string): Promise<Campaign> {
    return this.campaignRepository.complete(id, new Date());
  }

  async archive(id: string): Promise<Campaign> {
    return this.campaignRepository.archive(id, new Date());
  }
}
