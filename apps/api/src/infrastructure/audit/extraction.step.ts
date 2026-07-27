import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runExtraction } from '@ai-visibility/extraction-engine';
import type { CrawlResult, EngineResult, ExtractionResult, InventoryResult } from '@ai-visibility/contracts';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

@Injectable()
export class ExtractionStep implements WorkflowStep {
  readonly name = 'extraction';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const discoveryResult = context.results.discovery as EngineResult<DiscoveryResult>;
    const crawlResult = context.results.crawl as EngineResult<CrawlResult>;
    const inventoryResult = context.results.inventory as EngineResult<InventoryResult>;

    const startedAt = new Date();
    const output = await runExtraction(
      context.auditId,
      crawlResult.output!,
      discoveryResult.output!,
      inventoryResult.output!,
      context.correlationId,
    );
    const completedAt = new Date();

    const extraction: EngineResult<ExtractionResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, extraction } };
  }
}
