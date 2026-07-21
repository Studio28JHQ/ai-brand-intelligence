import type { AuditContext, PipelineResults } from '@ai-visibility/core';

export const EXECUTION_PIPELINE_PORT = Symbol('EXECUTION_PIPELINE_PORT');

export interface ExecutionPipelinePort {
  run(context: AuditContext): Promise<PipelineResults>;
}
