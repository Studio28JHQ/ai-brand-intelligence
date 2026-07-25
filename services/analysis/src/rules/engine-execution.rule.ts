import type { Rule } from '@ai-visibility/rules';
import type { WorkflowResult } from '@ai-visibility/contracts';

const CATEGORY = 'execution';

export function createEngineExecutionRule(engineName: string): Rule<WorkflowResult> {
  return {
    id: `${engineName}-execution`,
    category: CATEGORY,
    sourceEngine: engineName,
    evaluate(workflowResult: WorkflowResult) {
      const engineResult = workflowResult[engineName];
      const status = engineResult?.status ?? 'missing';

      return {
        outcome: status === 'success' ? 'pass' : 'fail',
        evidence: { status },
      };
    },
  };
}
