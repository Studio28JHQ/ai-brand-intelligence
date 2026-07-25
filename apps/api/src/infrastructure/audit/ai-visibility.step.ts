import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runAiVisibilityAssessment } from '@ai-visibility/ai-visibility-engine';
import type { AiVisibilityResult, EngineResult, KnowledgeGraphResult } from '@ai-visibility/contracts';

@Injectable()
export class AiVisibilityStep implements WorkflowStep {
  readonly name = 'aiVisibility';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const knowledgeGraphResult = context.results.knowledgeGraph as EngineResult<KnowledgeGraphResult>;

    const startedAt = new Date();
    const output = await runAiVisibilityAssessment(context.auditId, knowledgeGraphResult.output!);
    const completedAt = new Date();

    const aiVisibility: EngineResult<AiVisibilityResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, aiVisibility } };
  }
}
