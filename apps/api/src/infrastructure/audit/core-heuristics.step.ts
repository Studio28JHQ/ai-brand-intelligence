import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runHeuristics } from '@ai-visibility/heuristics-engine';
import type { EngineResult, ExtractionResult, HeuristicResult } from '@ai-visibility/contracts';

@Injectable()
export class CoreHeuristicsStep implements WorkflowStep {
  readonly name = 'heuristics';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const extraction = context.results.extraction as EngineResult<ExtractionResult>;

    const startedAt = new Date();
    const output = await runHeuristics(context.auditId, extraction.output!.signals, 'core', context.correlationId);
    const completedAt = new Date();

    const heuristics: EngineResult<HeuristicResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, heuristics } };
  }
}
