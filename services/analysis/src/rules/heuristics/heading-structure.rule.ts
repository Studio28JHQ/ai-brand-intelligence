import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createHeadingStructureRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-heading-structure',
    version: '1.0.0',
    category: 'accessibility',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'heading-structure-quality');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'heading-structure-quality heuristic missing' } };
      }

      const valid =
        heuristic.value.hasSingleH1 === true &&
        heuristic.value.hierarchyValid === true &&
        Number(heuristic.value.emptyHeadingCount ?? 0) === 0;

      return {
        outcome: valid ? 'pass' : 'fail',
        evidence: heuristic.value,
      };
    },
  };
}
