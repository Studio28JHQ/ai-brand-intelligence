import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createInternalLinkingRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-internal-linking',
    version: '1.0.0',
    category: 'seo',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'internal-linking-health');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'internal-linking-health heuristic missing' } };
      }

      return {
        outcome: heuristic.value.band === 'none' ? 'fail' : 'pass',
        evidence: heuristic.value,
      };
    },
  };
}
