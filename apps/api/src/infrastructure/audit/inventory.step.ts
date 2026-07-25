import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runInventory } from '@ai-visibility/inventory-engine';
import type { CrawlResult } from '@ai-visibility/contracts';

@Injectable()
export class InventoryStep implements WorkflowStep {
  readonly name = 'inventory';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const crawl = context.results.crawl as CrawlResult;
    const inventory = await runInventory(context.auditId, crawl.html, crawl.finalUrl);

    return { ...context, results: { ...context.results, inventory } };
  }
}
