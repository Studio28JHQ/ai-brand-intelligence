import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runAnalysis } from '@ai-visibility/analysis-engine';
import type { AnalysisResult, EngineResult } from '@ai-visibility/contracts';

@Injectable()
export class AnalysisStep implements WorkflowStep {
  readonly name = 'analysis';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const startedAt = new Date();
    const output = await runAnalysis(context.auditId, context.results, context.correlationId, 'core');
    const completedAt = new Date();

    const analysis: EngineResult<AnalysisResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, analysis } };
  }
}
