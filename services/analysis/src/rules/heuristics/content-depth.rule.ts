import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createContentDepthRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-content-depth',
    version: '1.0.0',
    category: 'content',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'content-depth');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'content-depth heuristic missing' } };
      }

      return {
        outcome: heuristic.value.band === 'thin' ? 'fail' : 'pass',
        evidence: heuristic.value,
      };
    },
  };
}
