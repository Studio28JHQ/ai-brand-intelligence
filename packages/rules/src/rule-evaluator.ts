import { Rule, RuleOutcome } from './rule';

export interface RuleEvaluationResult {
  ruleId: string;
  category: string;
  sourceEngine: string;
  outcome: RuleOutcome;
  evidence: Record<string, unknown>;
}

export class RuleEvaluator<TInput> {
  evaluate(rules: ReadonlyArray<Rule<TInput>>, input: TInput): RuleEvaluationResult[] {
    return rules.map((rule) => {
      const { outcome, evidence } = rule.evaluate(input);

      return {
        ruleId: rule.id,
        category: rule.category,
        sourceEngine: rule.sourceEngine,
        outcome,
        evidence,
      };
    });
  }
}
