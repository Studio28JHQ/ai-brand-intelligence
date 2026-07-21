import { Inject, Injectable } from '@nestjs/common';
import { ExecutionPipeline } from '@ai-visibility/core';
import type { AuditContext, Engine, PipelineResults } from '@ai-visibility/core';
import { ExecutionPipelinePort } from '../../domain/audit/execution-pipeline.port';
import { AUDIT_ENGINES } from '../../domain/audit/audit-engines.token';

@Injectable()
export class ExecutionPipelineAdapter implements ExecutionPipelinePort {
  private readonly pipeline: ExecutionPipeline;

  constructor(@Inject(AUDIT_ENGINES) engines: Engine[]) {
    this.pipeline = new ExecutionPipeline(engines);
  }

  async run(context: AuditContext): Promise<PipelineResults> {
    return this.pipeline.run(context);
  }
}
