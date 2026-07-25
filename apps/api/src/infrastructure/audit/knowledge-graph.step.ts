import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runKnowledgeGraph } from '@ai-visibility/knowledge-graph-engine';
import type { EngineResult, EntityResult, KnowledgeGraphResult } from '@ai-visibility/contracts';

@Injectable()
export class KnowledgeGraphStep implements WorkflowStep {
  readonly name = 'knowledgeGraph';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const entityResult = context.results.entity as EngineResult<EntityResult>;

    const startedAt = new Date();
    const output = await runKnowledgeGraph(context.auditId, entityResult.output!.entities);
    const completedAt = new Date();

    const knowledgeGraph: EngineResult<KnowledgeGraphResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, knowledgeGraph } };
  }
}
