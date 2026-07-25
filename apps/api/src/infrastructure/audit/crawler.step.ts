import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runCrawl } from '@ai-visibility/crawler-engine';
import type { CrawlResult, EngineResult } from '@ai-visibility/contracts';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

@Injectable()
export class CrawlerStep implements WorkflowStep {
  readonly name = 'crawl';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const discoveryResult = context.results.discovery as EngineResult<DiscoveryResult>;

    const startedAt = new Date();
    const output = await runCrawl(context.auditId, discoveryResult.output!.normalizedUrl, context.correlationId);
    const completedAt = new Date();

    const crawl: EngineResult<CrawlResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, crawl } };
  }
}
