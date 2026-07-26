import { Module } from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../../domain/project/project.repository';
import { ProjectQueryService } from '../../application/project/project-query.service';
import { SetProjectBaselineUseCase } from '../../application/project/set-project-baseline.use-case';
import { ExecutiveDashboardQueryService } from '../../application/dashboard/executive-dashboard.query-service';
import { CreateCampaignUseCase } from '../../application/campaign/create-campaign.use-case';
import { CampaignQueryService } from '../../application/campaign/campaign-query.service';
import { PrismaProjectRepository } from '../../infrastructure/project/prisma-project.repository';
import { BaselineHistoryReadRepository } from '../../infrastructure/project/baseline-history-read.repository';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { AuditRepositoryModule } from '../../infrastructure/audit/audit-repository.module';
import { ClientRepositoryModule } from '../../infrastructure/client/client-repository.module';
import { CampaignRepositoryModule } from '../../infrastructure/campaign/campaign-repository.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ProjectController } from './project.controller';

@Module({
  imports: [DatabaseModule, AuditRepositoryModule, ClientRepositoryModule, CampaignRepositoryModule],
  controllers: [ProjectController],
  providers: [
    ProjectQueryService,
    SetProjectBaselineUseCase,
    ExecutiveDashboardQueryService,
    CreateCampaignUseCase,
    CampaignQueryService,
    BaselineHistoryReadRepository,
    FindingReadRepository,
    AiVisibilityReadRepository,
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
