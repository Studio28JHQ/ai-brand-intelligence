import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runRecommendation } from '@ai-visibility/recommendation-engine';
import type { AiVisibilityResult, AnalysisResult, EngineResult, RecommendationResult } from '@ai-visibility/contracts';

@Injectable()
export class RecommendationStep implements WorkflowStep {
  readonly name = 'recommendation';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const analysisResult = context.results.analysis as EngineResult<AnalysisResult>;
    const aiVisibilityResult = context.results.aiVisibility as EngineResult<AiVisibilityResult>;

    const startedAt = new Date();
    const output = await runRecommendation(
      context.auditId,
      analysisResult.output!.findings,
      aiVisibilityResult.output!.assessment,
    );
    const completedAt = new Date();

    const recommendation: EngineResult<RecommendationResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, recommendation } };
  }
}
