import { RuleEvaluator } from '@ai-visibility/rules';
import type { Finding, FindingClassification } from '@ai-visibility/contracts';
import { buildClassificationRuleRegistry } from './rules/rule-registry';

export function evaluateClassifications(auditId: string, findings: Finding[]): FindingClassification[] {
  const registry = buildClassificationRuleRegistry();
  const evaluator = new RuleEvaluator<Finding>();

  return findings.map((finding) => {
    const [evaluation] = evaluator.evaluate(registry.getAll(), finding);

    return {
      id: `${auditId}:${finding.id}`,
      findingId: finding.id,
      auditId,
      classification: evaluation.outcome === 'fail' ? 'impact' : 'no-impact',
      rationale: String(evaluation.evidence.rationale),
    };
  });
}
