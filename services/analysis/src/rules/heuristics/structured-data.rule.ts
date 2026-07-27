import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createStructuredDataRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-structured-data',
    version: '1.0.0',
    category: 'seo',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'structured-data-coverage');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'structured-data-coverage heuristic missing' } };
      }

      return {
        outcome: heuristic.value.coverageBand === 'none' ? 'fail' : 'pass',
        evidence: heuristic.value,
      };
    },
  };
}
