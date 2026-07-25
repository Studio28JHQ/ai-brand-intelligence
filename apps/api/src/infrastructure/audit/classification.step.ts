import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runClassification } from '@ai-visibility/classification-engine';
import type { AnalysisResult, ClassificationResult, EngineResult } from '@ai-visibility/contracts';

@Injectable()
export class ClassificationStep implements WorkflowStep {
  readonly name = 'classification';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const analysisResult = context.results.analysis as EngineResult<AnalysisResult>;

    const startedAt = new Date();
    const output = await runClassification(context.auditId, analysisResult.output!.findings);
    const completedAt = new Date();

    const classification: EngineResult<ClassificationResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, classification } };
  }
}
