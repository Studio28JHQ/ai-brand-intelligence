export type RuleOutcome = 'pass' | 'fail';

export interface RuleEvaluation {
  outcome: RuleOutcome;
  evidence: Record<string, unknown>;
}

export interface Rule<TInput> {
  readonly id: string;
  readonly category: string;
  readonly sourceEngine: string;
  evaluate(input: TInput): RuleEvaluation;
}
