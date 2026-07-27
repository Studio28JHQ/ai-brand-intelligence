import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

const MINIMUM_ACCEPTABLE_SCORE = 50;

export function createPerformanceEstimateRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-performance-estimate',
    version: '1.0.0',
    category: 'performance',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'performance-estimate');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'performance-estimate heuristic missing' } };
      }

      const score = Number(heuristic.value.estimatedPerformanceScore ?? 0);

      return {
        outcome: score >= MINIMUM_ACCEPTABLE_SCORE ? 'pass' : 'fail',
        evidence: heuristic.value,
      };
    },
  };
}
