import { Inject, Injectable } from '@nestjs/common';
import type { WorkflowContext } from '@ai-visibility/core';
import type { AnalysisResult, CrawlResult, EngineResult, InventoryResult } from '@ai-visibility/contracts';
import { WORKFLOW_PORT, WorkflowPort } from '../../domain/audit/workflow.port';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

export interface ExecuteAuditResult {
  discovery: DiscoveryResult;
  crawl: CrawlResult;
  inventory: InventoryResult;
  analysis: AnalysisResult;
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

    return {
      discovery: discovery.output!,
      crawl: crawl.output!,
      inventory: inventory.output!,
      analysis: analysis.output!,
    };
  }
}
