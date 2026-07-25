import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runInventory } from '@ai-visibility/inventory-engine';
import type { CrawlResult, EngineResult, InventoryResult } from '@ai-visibility/contracts';

@Injectable()
export class InventoryStep implements WorkflowStep {
  readonly name = 'inventory';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const crawlResult = context.results.crawl as EngineResult<CrawlResult>;

    const startedAt = new Date();
    const output = await runInventory(context.auditId, crawlResult.output!.html, crawlResult.output!.finalUrl);
    const completedAt = new Date();

    const inventory: EngineResult<InventoryResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, inventory } };
  }
}
