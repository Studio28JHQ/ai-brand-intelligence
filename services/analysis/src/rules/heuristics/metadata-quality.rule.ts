import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { findCoreHeuristic } from './heuristic-lookup';

export function createMetadataQualityRule(): Rule<WorkflowResult> {
  return {
    id: 'seo-metadata-quality',
    version: '1.0.0',
    category: 'seo',
    sourceEngine: 'analysis',
    evaluate(workflowResult: WorkflowResult) {
      const heuristic = findCoreHeuristic(workflowResult, 'metadata-quality');
      if (!heuristic) {
        return { outcome: 'skip', evidence: { reason: 'metadata-quality heuristic missing' } };
      }

      const titleOk = heuristic.value.titleBand === 'ok';
      const descriptionOk = heuristic.value.descriptionBand === 'ok';

      return {
        outcome: titleOk && descriptionOk ? 'pass' : 'fail',
        evidence: heuristic.value,
      };
    },
  };
}
