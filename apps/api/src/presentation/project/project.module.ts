import { Module } from '@nestjs/common';
import { ProjectQueryService } from '../../application/project/project-query.service';
import { SetProjectBaselineUseCase } from '../../application/project/set-project-baseline.use-case';
import { ExecutiveDashboardQueryService } from '../../application/dashboard/executive-dashboard.query-service';
import { CreateCampaignUseCase } from '../../application/campaign/create-campaign.use-case';
import { CampaignQueryService } from '../../application/campaign/campaign-query.service';
import { ImpactAssessmentService } from '../../application/impact-assessment/impact-assessment.service';
import { AuditComparisonService } from '../../application/comparison/audit-comparison.service';
import { BaselineHistoryReadRepository } from '../../infrastructure/project/baseline-history-read.repository';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { EntityReadRepository } from '../../infrastructure/comparison/entity-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { ProjectRepositoryModule } from '../../infrastructure/project/project-repository.module';
import { AuditRepositoryModule } from '../../infrastructure/audit/audit-repository.module';
import { ClientRepositoryModule } from '../../infrastructure/client/client-repository.module';
import { CampaignRepositoryModule } from '../../infrastructure/campaign/campaign-repository.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ProjectController } from './project.controller';

@Module({
  imports: [
    DatabaseModule,
    ProjectRepositoryModule,
    AuditRepositoryModule,
    ClientRepositoryModule,
    CampaignRepositoryModule,
  ],
  controllers: [ProjectController],
  providers: [
    ProjectQueryService,
    SetProjectBaselineUseCase,
    ExecutiveDashboardQueryService,
    CreateCampaignUseCase,
    CampaignQueryService,
    ImpactAssessmentService,
    AuditComparisonService,
    BaselineHistoryReadRepository,
    FindingReadRepository,
    EntityReadRepository,
    AiVisibilityReadRepository,
    KnowledgeGraphReadRepository,
  ],
  exports: [ProjectRepositoryModule],
})
export class ProjectModule {}
