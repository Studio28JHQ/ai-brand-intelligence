import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createTechnicalFoundationRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-technical-foundation',
    version: '1.0.0',
    category: 'technical',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'technical-foundation');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'technical-foundation heuristic missing' } };
      }

      const valid =
        heuristic.value.hasRobotsTxt === true &&
        heuristic.value.hasSitemap === true &&
        heuristic.value.urlLengthBand === 'ok';

      return {
        outcome: valid ? 'pass' : 'fail',
        evidence: heuristic.value,
      };
    },
  };
}
