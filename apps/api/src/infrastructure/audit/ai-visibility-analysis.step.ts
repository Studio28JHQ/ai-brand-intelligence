import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runAnalysis } from '@ai-visibility/analysis-engine';
import { combineRuleSetVersions } from '@ai-visibility/rules';
import type { AnalysisResult, EngineResult } from '@ai-visibility/contracts';

// Deliberately merges its result into the SAME `analysis` key CoreAnalysisStep already
// populated, rather than introducing a second results key — the audit's Findings/ruleSetVersion
// extraction (create-audit.use-case.ts) reads `results.analysis` as a single combined result,
// exactly as it did before Core/AI-Visibility Rules were split into two scoped invocations.
@Injectable()
export class AiVisibilityAnalysisStep implements WorkflowStep {
  readonly name = 'aiVisibilityAnalysis';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const coreAnalysis = context.results.analysis as EngineResult<AnalysisResult>;

    const startedAt = new Date();
    const aiVisibilityResult = await runAnalysis(context.auditId, context.results, context.correlationId, 'ai-visibility');
    const completedAt = new Date();

    const mergedOutput: AnalysisResult = {
      findings: [...coreAnalysis.output!.findings, ...aiVisibilityResult.findings],
      ruleSetVersion: combineRuleSetVersions([coreAnalysis.output!.ruleSetVersion, aiVisibilityResult.ruleSetVersion]),
    };

    const analysis: EngineResult<AnalysisResult> = {
      ...coreAnalysis,
      output: mergedOutput,
      completedAt: completedAt.toISOString(),
      durationMs: coreAnalysis.durationMs + (completedAt.getTime() - startedAt.getTime()),
    };

    // Also stamped under this step's own name so Workflow.run's progress/history listeners
    // (which read `results[step.name]`) observe this step, even though its actual effect lands
    // on the shared `analysis` key above.
    return { ...context, results: { ...context.results, analysis, aiVisibilityAnalysis: analysis } };
  }
}
