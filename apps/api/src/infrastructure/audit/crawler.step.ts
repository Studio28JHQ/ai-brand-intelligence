import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runCrawl } from '@ai-visibility/crawler-engine';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

@Injectable()
export class CrawlerStep implements WorkflowStep {
  readonly name = 'crawl';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const discovery = context.results.discovery as DiscoveryResult;
    const crawl = await runCrawl(context.auditId, discovery.normalizedUrl);

    return { ...context, results: { ...context.results, crawl } };
  }
}
