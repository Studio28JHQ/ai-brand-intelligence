import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createImageAccessibilityRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-image-accessibility',
    version: '1.0.0',
    category: 'accessibility',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'image-accessibility');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'image-accessibility heuristic missing' } };
      }

      return {
        outcome: heuristic.value.band === 'good' ? 'pass' : 'fail',
        evidence: heuristic.value,
      };
    },
  };
}
