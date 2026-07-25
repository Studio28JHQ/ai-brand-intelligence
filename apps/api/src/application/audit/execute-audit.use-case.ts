import { Inject, Injectable } from '@nestjs/common';
import type { WorkflowContext } from '@ai-visibility/core';
import type { CrawlResult, InventoryResult } from '@ai-visibility/contracts';
import { WORKFLOW_PORT, WorkflowPort } from '../../domain/audit/workflow.port';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

export interface ExecuteAuditResult {
  discovery: DiscoveryResult;
  crawl: CrawlResult;
  inventory: InventoryResult;
}

@Injectable()
export class ExecuteAuditUseCase {
  constructor(@Inject(WORKFLOW_PORT) private readonly workflow: WorkflowPort) {}

  async execute(auditId: string, url: string): Promise<ExecuteAuditResult> {
    const context: WorkflowContext = { auditId, url, results: {} };
    const { results } = await this.workflow.run(context);

    return {
      discovery: results.discovery as DiscoveryResult,
      crawl: results.crawl as CrawlResult,
      inventory: results.inventory as InventoryResult,
    };
  }
}
