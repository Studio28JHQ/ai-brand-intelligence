import { Module } from '@nestjs/common';
import { ProjectQueryService } from '../../application/project/project-query.service';
import { SetProjectBaselineUseCase } from '../../application/project/set-project-baseline.use-case';
import { ExecutiveDashboardQueryService } from '../../application/dashboard/executive-dashboard.query-service';
import { CreateCampaignUseCase } from '../../application/campaign/create-campaign.use-case';
import { CampaignQueryService } from '../../application/campaign/campaign-query.service';
import { ImpactAssessmentService } from '../../application/impact-assessment/impact-assessment.service';
import { CreateOptimizationCycleUseCase } from '../../application/optimization-cycle/create-optimization-cycle.use-case';
import { OptimizationCycleQueryService } from '../../application/optimization-cycle/optimization-cycle-query.service';
import { ExecutiveClientReportBuilderService } from '../../application/executive-client-report/executive-client-report-builder.service';
import { AiContextBuilderService } from '../../application/ai-context/ai-context-builder.service';
import { AiConversationOrchestratorService } from '../../application/ai-conversation/ai-conversation-orchestrator.service';
import { AI_PROVIDER } from '../../application/ai-conversation/ai-provider';
import { AuditComparisonService } from '../../application/comparison/audit-comparison.service';
import { StructuredFactAiProvider } from '../../infrastructure/ai-conversation/structured-fact-ai-provider';
import { BaselineHistoryReadRepository } from '../../infrastructure/project/baseline-history-read.repository';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { EntityReadRepository } from '../../infrastructure/comparison/entity-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { ProjectRepositoryModule } from '../../infrastructure/project/project-repository.module';
import { AuditRepositoryModule } from '../../infrastructure/audit/audit-repository.module';
import { ClientRepositoryModule } from '../../infrastructure/client/client-repository.module';
import { CampaignRepositoryModule } from '../../infrastructure/campaign/campaign-repository.module';
import { OptimizationCycleRepositoryModule } from '../../infrastructure/optimization-cycle/optimization-cycle-repository.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ProjectController } from './project.controller';

@Module({
  imports: [
    DatabaseModule,
    ProjectRepositoryModule,
    AuditRepositoryModule,
    ClientRepositoryModule,
    CampaignRepositoryModule,
    OptimizationCycleRepositoryModule,
  ],
  controllers: [ProjectController],
  providers: [
    ProjectQueryService,
    SetProjectBaselineUseCase,
    ExecutiveDashboardQueryService,
    CreateCampaignUseCase,
    CampaignQueryService,
    ImpactAssessmentService,
    CreateOptimizationCycleUseCase,
    OptimizationCycleQueryService,
    ExecutiveClientReportBuilderService,
    AiContextBuilderService,
    AiConversationOrchestratorService,
    { provide: AI_PROVIDER, useClass: StructuredFactAiProvider },
    AuditComparisonService,
    BaselineHistoryReadRepository,
    FindingReadRepository,
    EntityReadRepository,
    AiVisibilityReadRepository,
    KnowledgeGraphReadRepository,
  ],
  exports: [ProjectRepositoryModule, ClientRepositoryModule, AiContextBuilderService, ExecutiveClientReportBuilderService],
})
export class ProjectModule {}
