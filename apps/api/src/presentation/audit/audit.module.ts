import { Module } from '@nestjs/common';
import type { ExecutionPlan } from '@ai-visibility/core';
import { WORKFLOW_PORT } from '../../domain/audit/workflow.port';
import { AUDIT_EXECUTION_PLAN } from '../../domain/audit/audit-execution-plan.token';
import { CapabilityRegistry } from '../../domain/audit/capability-registry';
import { ExecutionPlanBuilder } from '../../domain/audit/execution-plan-builder';
import { toCapability } from '../../domain/audit/capability';
import { buildFullAuditCapabilityCatalog } from '../../domain/audit/full-audit-capability-catalog';
import { FULL_AUDIT_TYPE } from '../../domain/audit/full-audit.type';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { ExecuteAuditUseCase } from '../../application/audit/execute-audit.use-case';
import { AuditQueryService } from '../../application/audit/audit-query.service';
import { AuditComparisonService } from '../../application/comparison/audit-comparison.service';
import { AiVisibilityStatusRepository } from '../../infrastructure/audit/ai-visibility-status.repository';
import { WorkflowExecutionHistoryRepository } from '../../infrastructure/audit/workflow-execution-history.repository';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { EntityReadRepository } from '../../infrastructure/comparison/entity-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { DiscoveryStep } from '../../infrastructure/audit/discovery.step';
import { CrawlerStep } from '../../infrastructure/audit/crawler.step';
import { InventoryStep } from '../../infrastructure/audit/inventory.step';
import { AnalysisStep } from '../../infrastructure/audit/analysis.step';
import { EntityStep } from '../../infrastructure/audit/entity.step';
import { KnowledgeGraphStep } from '../../infrastructure/audit/knowledge-graph.step';
import { AiVisibilityStep } from '../../infrastructure/audit/ai-visibility.step';
import { WorkflowAdapter } from '../../infrastructure/audit/workflow.adapter';
import { AuditRepositoryModule } from '../../infrastructure/audit/audit-repository.module';
import { ClientRepositoryModule } from '../../infrastructure/client/client-repository.module';
import { OptimizationCycleRepositoryModule } from '../../infrastructure/optimization-cycle/optimization-cycle-repository.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ProjectModule } from '../project/project.module';
import { EnsureActiveCycleUseCase } from '../../application/optimization-cycle/ensure-active-cycle.use-case';
import { AuditController } from './audit.controller';

@Module({
  imports: [DatabaseModule, AuditRepositoryModule, ClientRepositoryModule, OptimizationCycleRepositoryModule, ProjectModule],
  controllers: [AuditController],
  providers: [
    CreateAuditUseCase,
    ExecuteAuditUseCase,
    AuditQueryService,
    AuditComparisonService,
    AiVisibilityStatusRepository,
    WorkflowExecutionHistoryRepository,
    EnsureActiveCycleUseCase,
    FindingReadRepository,
    EntityReadRepository,
    AiVisibilityReadRepository,
    { provide: WORKFLOW_PORT, useClass: WorkflowAdapter },
    DiscoveryStep,
    CrawlerStep,
    InventoryStep,
    AnalysisStep,
    EntityStep,
    KnowledgeGraphStep,
    AiVisibilityStep,
    {
      provide: AUDIT_EXECUTION_PLAN,
      useFactory: (
        discoveryStep: DiscoveryStep,
        crawlerStep: CrawlerStep,
        inventoryStep: InventoryStep,
        analysisStep: AnalysisStep,
        entityStep: EntityStep,
        knowledgeGraphStep: KnowledgeGraphStep,
        aiVisibilityStep: AiVisibilityStep,
      ): ExecutionPlan => {
        const registry = new CapabilityRegistry();
        [
          discoveryStep,
          crawlerStep,
          inventoryStep,
          analysisStep,
          entityStep,
          knowledgeGraphStep,
          aiVisibilityStep,
        ].forEach((step) => registry.register(toCapability(step)));

        const catalog = buildFullAuditCapabilityCatalog();

        return new ExecutionPlanBuilder(catalog, registry).build(FULL_AUDIT_TYPE);
      },
      inject: [
        DiscoveryStep,
        CrawlerStep,
        InventoryStep,
        AnalysisStep,
        EntityStep,
        KnowledgeGraphStep,
        AiVisibilityStep,
      ],
    },
  ],
})
export class AuditModule {}
