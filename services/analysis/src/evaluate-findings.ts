import type { Finding, WorkflowResult } from '@ai-visibility/contracts';

const EXECUTION_CATEGORY = 'execution';

export function evaluateFindings(auditId: string, workflowResult: WorkflowResult): Finding[] {
  return Object.values(workflowResult).map((engineResult) => ({
    id: `${auditId}:${engineResult.engine}`,
    auditId,
    category: EXECUTION_CATEGORY,
    sourceEngine: engineResult.engine,
    status: engineResult.status,
  }));
}
