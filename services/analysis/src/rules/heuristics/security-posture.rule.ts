import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createSecurityPostureRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-security-posture',
    version: '1.0.0',
    category: 'technical',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'security-posture');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'security-posture heuristic missing' } };
      }

      return {
        outcome: heuristic.value.isSecure === true ? 'pass' : 'fail',
        evidence: heuristic.value,
      };
    },
  };
}
