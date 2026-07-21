import { Inject, Injectable } from '@nestjs/common';
import type { AuditContext } from '@ai-visibility/core';
import type { CrawlResult } from '@ai-visibility/contracts';
import { EXECUTION_PIPELINE_PORT, ExecutionPipelinePort } from '../../domain/audit/execution-pipeline.port';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

export interface ExecuteAuditResult {
  discovery: DiscoveryResult;
  crawl: CrawlResult;
}

@Injectable()
export class ExecuteAuditUseCase {
  constructor(@Inject(EXECUTION_PIPELINE_PORT) private readonly pipeline: ExecutionPipelinePort) {}

  async execute(auditId: string, url: string): Promise<ExecuteAuditResult> {
    const context: AuditContext = { auditId, url };
    const results = await this.pipeline.run(context);

    return {
      discovery: results.discovery as DiscoveryResult,
      crawl: results.crawl as CrawlResult,
    };
  }
}
