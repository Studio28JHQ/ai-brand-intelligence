import { Module } from '@nestjs/common';
import { CAMPAIGN_REPOSITORY } from '../../domain/campaign/campaign.repository';
import { OPTIMIZATION_ACTION_REPOSITORY } from '../../domain/campaign/optimization-action.repository';
import { PrismaCampaignRepository } from './prisma-campaign.repository';
import { PrismaOptimizationActionRepository } from './prisma-optimization-action.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: CAMPAIGN_REPOSITORY, useClass: PrismaCampaignRepository },
    { provide: OPTIMIZATION_ACTION_REPOSITORY, useClass: PrismaOptimizationActionRepository },
  ],
  exports: [CAMPAIGN_REPOSITORY, OPTIMIZATION_ACTION_REPOSITORY],
})
export class CampaignRepositoryModule {}
