import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createIndexabilityRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-indexability',
    version: '1.0.0',
    category: 'seo',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'indexability');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'indexability heuristic missing' } };
      }

      return {
        outcome: heuristic.value.isIndexable === true ? 'pass' : 'fail',
        evidence: heuristic.value,
      };
    },
  };
}
