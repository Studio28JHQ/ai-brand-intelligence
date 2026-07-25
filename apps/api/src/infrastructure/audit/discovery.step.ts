import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runDiscovery } from '@ai-visibility/discovery-engine';

@Injectable()
export class DiscoveryStep implements WorkflowStep {
  readonly name = 'discovery';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const discovery = await runDiscovery(context.auditId, context.url);

    return { ...context, results: { ...context.results, discovery } };
  }
}
