import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runDiscovery } from '@ai-visibility/discovery-engine';
import type { EngineResult } from '@ai-visibility/contracts';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

@Injectable()
export class DiscoveryStep implements WorkflowStep {
  readonly name = 'discovery';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const startedAt = new Date();
    const output = await runDiscovery(context.auditId, context.url);
    const completedAt = new Date();

    const discovery: EngineResult<DiscoveryResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, discovery } };
  }
}
