import { Injectable } from '@nestjs/common';
import type { AuditContext, Engine, PipelineResults } from '@ai-visibility/core';
import { runInventory } from '@ai-visibility/inventory-engine';
import type { CrawlResult, InventoryResult } from '@ai-visibility/contracts';

@Injectable()
export class InventoryEngineAdapter implements Engine<InventoryResult> {
  readonly name = 'inventory';

  async run(context: AuditContext, previousResults: PipelineResults): Promise<InventoryResult> {
    const crawl = previousResults.crawl as CrawlResult;
    return runInventory(context.auditId, crawl.html, crawl.finalUrl);
  }
}
