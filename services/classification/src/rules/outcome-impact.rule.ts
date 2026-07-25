import type { Rule } from '@ai-visibility/rules';
import type { Finding } from '@ai-visibility/contracts';

export function createOutcomeImpactRule(): Rule<Finding> {
  return {
    id: 'outcome-impact',
    category: 'impact',
    sourceEngine: 'classification',
    evaluate(finding: Finding) {
      const rationale =
        finding.outcome === 'fail'
          ? `Rule '${finding.ruleId}' evaluated to 'fail' for engine '${finding.sourceEngine}'.`
          : `Rule '${finding.ruleId}' evaluated to 'pass' for engine '${finding.sourceEngine}'.`;

      return {
        outcome: finding.outcome === 'fail' ? 'fail' : 'pass',
        evidence: { rationale },
      };
    },
  };
}
