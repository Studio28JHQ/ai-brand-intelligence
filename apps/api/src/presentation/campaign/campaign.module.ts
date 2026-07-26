import { Module } from '@nestjs/common';
import { CampaignRepositoryModule } from '../../infrastructure/campaign/campaign-repository.module';
import { ProjectRepositoryModule } from '../../infrastructure/project/project-repository.module';
import { AuditRepositoryModule } from '../../infrastructure/audit/audit-repository.module';
import { CampaignQueryService } from '../../application/campaign/campaign-query.service';
import { TransitionCampaignStatusUseCase } from '../../application/campaign/transition-campaign-status.use-case';
import { TransitionActionStatusUseCase } from '../../application/campaign/transition-action-status.use-case';
import { ImpactAssessmentService } from '../../application/impact-assessment/impact-assessment.service';
import { AuditComparisonService } from '../../application/comparison/audit-comparison.service';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { EntityReadRepository } from '../../infrastructure/comparison/entity-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CampaignController } from './campaign.controller';

@Module({
  imports: [DatabaseModule, CampaignRepositoryModule, ProjectRepositoryModule, AuditRepositoryModule],
  controllers: [CampaignController],
  providers: [
    CampaignQueryService,
    TransitionCampaignStatusUseCase,
    TransitionActionStatusUseCase,
    ImpactAssessmentService,
    AuditComparisonService,
    FindingReadRepository,
    EntityReadRepository,
    AiVisibilityReadRepository,
  ],
})
export class CampaignModule {}
