import { Module } from '@nestjs/common';
import type { WorkflowStep } from '@ai-visibility/core';
import { AUDIT_REPOSITORY } from '../../domain/audit/audit.repository';
import { WORKFLOW_PORT } from '../../domain/audit/workflow.port';
import { AUDIT_WORKFLOW_STEPS } from '../../domain/audit/audit-workflow-steps.token';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { ExecuteAuditUseCase } from '../../application/audit/execute-audit.use-case';
import { PrismaAuditRepository } from '../../infrastructure/audit/prisma-audit.repository';
import { DiscoveryStep } from '../../infrastructure/audit/discovery.step';
import { CrawlerStep } from '../../infrastructure/audit/crawler.step';
import { InventoryStep } from '../../infrastructure/audit/inventory.step';
import { AnalysisStep } from '../../infrastructure/audit/analysis.step';
import { EntityStep } from '../../infrastructure/audit/entity.step';
import { KnowledgeGraphStep } from '../../infrastructure/audit/knowledge-graph.step';
import { AiVisibilityStep } from '../../infrastructure/audit/ai-visibility.step';
import { RecommendationStep } from '../../infrastructure/audit/recommendation.step';
import { WorkflowAdapter } from '../../infrastructure/audit/workflow.adapter';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuditController } from './audit.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [
    CreateAuditUseCase,
    ExecuteAuditUseCase,
    { provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository },
    { provide: WORKFLOW_PORT, useClass: WorkflowAdapter },
    DiscoveryStep,
    CrawlerStep,
    InventoryStep,
    AnalysisStep,
    EntityStep,
    KnowledgeGraphStep,
    AiVisibilityStep,
    RecommendationStep,
    {
      provide: AUDIT_WORKFLOW_STEPS,
      useFactory: (
        discoveryStep: DiscoveryStep,
        crawlerStep: CrawlerStep,
        inventoryStep: InventoryStep,
        analysisStep: AnalysisStep,
        entityStep: EntityStep,
        knowledgeGraphStep: KnowledgeGraphStep,
        aiVisibilityStep: AiVisibilityStep,
        recommendationStep: RecommendationStep,
      ): WorkflowStep[] => [
        discoveryStep,
        crawlerStep,
        inventoryStep,
        analysisStep,
        entityStep,
        knowledgeGraphStep,
        aiVisibilityStep,
        recommendationStep,
      ],
      inject: [
        DiscoveryStep,
        CrawlerStep,
        InventoryStep,
        AnalysisStep,
        EntityStep,
        KnowledgeGraphStep,
        AiVisibilityStep,
        RecommendationStep,
      ],
    },
  ],
})
export class AuditModule {}
