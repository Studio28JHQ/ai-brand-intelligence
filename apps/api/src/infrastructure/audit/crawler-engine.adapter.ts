import { Injectable } from '@nestjs/common';
import type { AuditContext, Engine, PipelineResults } from '@ai-visibility/core';
import { runCrawl } from '@ai-visibility/crawler-engine';
import type { CrawlResult } from '@ai-visibility/contracts';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

@Injectable()
export class CrawlerEngineAdapter implements Engine<CrawlResult> {
  readonly name = 'crawl';

  async run(context: AuditContext, previousResults: PipelineResults): Promise<CrawlResult> {
    const discovery = previousResults.discovery as DiscoveryResult;
    return runCrawl(context.auditId, discovery.normalizedUrl);
  }
}
