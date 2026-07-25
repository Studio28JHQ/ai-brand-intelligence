import { RuleEvaluator } from '@ai-visibility/rules';
import type { Finding, WorkflowResult } from '@ai-visibility/contracts';
import { buildRuleRegistry } from './rules/rule-registry';
import { classifySeverity } from './classify-finding';

export function evaluateFindings(auditId: string, workflowResult: WorkflowResult): Finding[] {
  const registry = buildRuleRegistry();
  const evaluator = new RuleEvaluator<WorkflowResult>();
  const evaluations = evaluator.evaluate(registry.getAll(), workflowResult);

  return evaluations.map((evaluation) => ({
    id: `${auditId}:${evaluation.ruleId}`,
    auditId,
    ruleId: evaluation.ruleId,
    category: evaluation.category,
    sourceEngine: evaluation.sourceEngine,
    outcome: evaluation.outcome,
    severity: classifySeverity(evaluation.outcome),
    evidence: evaluation.evidence,
  }));
}
