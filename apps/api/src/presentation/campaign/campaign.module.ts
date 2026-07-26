import { Module } from '@nestjs/common';
import { CampaignRepositoryModule } from '../../infrastructure/campaign/campaign-repository.module';
import { CampaignQueryService } from '../../application/campaign/campaign-query.service';
import { TransitionCampaignStatusUseCase } from '../../application/campaign/transition-campaign-status.use-case';
import { TransitionActionStatusUseCase } from '../../application/campaign/transition-action-status.use-case';
import { CampaignController } from './campaign.controller';

@Module({
  imports: [CampaignRepositoryModule],
  controllers: [CampaignController],
  providers: [CampaignQueryService, TransitionCampaignStatusUseCase, TransitionActionStatusUseCase],
})
export class CampaignModule {}
