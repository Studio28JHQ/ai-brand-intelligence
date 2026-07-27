import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runHeuristics } from '@ai-visibility/heuristics-engine';
import type { AiVisibilityResult, EngineResult, HeuristicResult } from '@ai-visibility/contracts';

@Injectable()
export class AiVisibilityHeuristicsStep implements WorkflowStep {
  readonly name = 'aiVisibilityHeuristics';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const aiVisibility = context.results.aiVisibility as EngineResult<AiVisibilityResult>;

    const startedAt = new Date();
    const output = await runHeuristics(
      context.auditId,
      aiVisibility.output!.signals,
      'ai-visibility',
      context.correlationId,
    );
    const completedAt = new Date();

    const aiVisibilityHeuristics: EngineResult<HeuristicResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, aiVisibilityHeuristics } };
  }
}
