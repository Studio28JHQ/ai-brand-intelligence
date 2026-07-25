import { Module } from '@nestjs/common';
import type { ExecutionPlan } from '@ai-visibility/core';
import { AUDIT_REPOSITORY } from '../../domain/audit/audit.repository';
import { WORKFLOW_PORT } from '../../domain/audit/workflow.port';
import { AUDIT_EXECUTION_PLAN } from '../../domain/audit/audit-execution-plan.token';
import { CapabilityRegistry } from '../../domain/audit/capability-registry';
import { ExecutionPlanBuilder } from '../../domain/audit/execution-plan-builder';
import { toCapability } from '../../domain/audit/capability';
import { FULL_AUDIT_TYPE } from '../../domain/audit/full-audit.type';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { ExecuteAuditUseCase } from '../../application/audit/execute-audit.use-case';
import { AuditQueryService } from '../../application/audit/audit-query.service';
import { PrismaAuditRepository } from '../../infrastructure/audit/prisma-audit.repository';
import { AiVisibilityStatusRepository } from '../../infrastructure/audit/ai-visibility-status.repository';
import { WorkflowExecutionHistoryRepository } from '../../infrastructure/audit/workflow-execution-history.repository';
import { DiscoveryStep } from '../../infrastructure/audit/discovery.step';
import { CrawlerStep } from '../../infrastructure/audit/crawler.step';
import { InventoryStep } from '../../infrastructure/audit/inventory.step';
import { AnalysisStep } from '../../infrastructure/audit/analysis.step';
import { EntityStep } from '../../infrastructure/audit/entity.step';
import { KnowledgeGraphStep } from '../../infrastructure/audit/knowledge-graph.step';
import { AiVisibilityStep } from '../../infrastructure/audit/ai-visibility.step';
import { WorkflowAdapter } from '../../infrastructure/audit/workflow.adapter';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuditController } from './audit.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [
    CreateAuditUseCase,
    ExecuteAuditUseCase,
    AuditQueryService,
    AiVisibilityStatusRepository,
    WorkflowExecutionHistoryRepository,
    { provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository },
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

        return new ExecutionPlanBuilder(registry).build(FULL_AUDIT_TYPE);
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
