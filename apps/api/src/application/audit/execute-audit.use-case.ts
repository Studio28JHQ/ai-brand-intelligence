import { Inject, Injectable } from '@nestjs/common';
import type { WorkflowContext } from '@ai-visibility/core';
import type {
  AiVisibilityResult,
  AnalysisResult,
  CrawlResult,
  EngineResult,
  EntityResult,
  InventoryResult,
  KnowledgeGraphResult,
  RecommendationResult,
} from '@ai-visibility/contracts';
import { WORKFLOW_PORT, WorkflowPort } from '../../domain/audit/workflow.port';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

export interface ExecuteAuditResult {
  discovery: DiscoveryResult;
  crawl: CrawlResult;
  inventory: InventoryResult;
  analysis: AnalysisResult;
  entity: EntityResult;
  knowledgeGraph: KnowledgeGraphResult;
  aiVisibility: AiVisibilityResult;
  recommendation: RecommendationResult;
}

@Injectable()
export class ExecuteAuditUseCase {
  constructor(@Inject(WORKFLOW_PORT) private readonly workflow: WorkflowPort) {}

  async execute(auditId: string, url: string): Promise<ExecuteAuditResult> {
    const context: WorkflowContext = { auditId, url, results: {} };
    const { results } = await this.workflow.run(context);

    const discovery = results.discovery as EngineResult<DiscoveryResult>;
    const crawl = results.crawl as EngineResult<CrawlResult>;
    const inventory = results.inventory as EngineResult<InventoryResult>;
    const analysis = results.analysis as EngineResult<AnalysisResult>;
    const entity = results.entity as EngineResult<EntityResult>;
    const knowledgeGraph = results.knowledgeGraph as EngineResult<KnowledgeGraphResult>;
    const aiVisibility = results.aiVisibility as EngineResult<AiVisibilityResult>;
    const recommendation = results.recommendation as EngineResult<RecommendationResult>;

    return {
      discovery: discovery.output!,
      crawl: crawl.output!,
      inventory: inventory.output!,
      analysis: analysis.output!,
      entity: entity.output!,
      knowledgeGraph: knowledgeGraph.output!,
      aiVisibility: aiVisibility.output!,
      recommendation: recommendation.output!,
    };
  }
}
