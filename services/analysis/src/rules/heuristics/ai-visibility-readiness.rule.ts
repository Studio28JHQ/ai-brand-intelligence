import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findAiVisibilityHeuristic } from './heuristic-lookup';

export function createAiVisibilityReadinessRule(): Rule<WorkflowResult> {
  return {
    id: 'ai-visibility-readiness',
    version: '1.0.0',
    category: 'ai-visibility',
    sourceEngine: 'aiVisibilityAnalysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findAiVisibilityHeuristic(workflowResult, 'ai-visibility-readiness');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'ai-visibility-readiness heuristic missing' } };
      }

      return {
        outcome: heuristic.value.status === 'ready' ? 'pass' : 'fail',
        evidence: heuristic.value,
      };
    },
  };
}
