import type { AssumptionCode, AssumptionFact } from '@ai-visibility/contracts';

const ASSUMPTION_DESCRIPTIONS: Record<AssumptionCode, string> = {
  BINARY_RULE_OUTCOME:
    'The Rule Engine returns only a definitive pass or fail outcome for this Finding, never a partial or uncertain one.',
  UNIFORM_RULE_APPLICABILITY:
    "The Optimization Rule's guidance applies the same way regardless of this Project's specific context.",
  FIXED_PIPELINE_ORDER: 'The Workflow Runtime executes Business Engines in the same fixed order for every Audit.',
};

export function buildAssumption(code: AssumptionCode): AssumptionFact {
  return { code, description: ASSUMPTION_DESCRIPTIONS[code] };
}
