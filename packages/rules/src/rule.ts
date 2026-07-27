// 'skip': the Rule's required upstream Signal/Heuristic was not present, so it never reached a
// real pass/fail judgment — distinct from 'fail', which means the check ran and the page did not
// meet it. Conflating the two would misreport "we never checked this" as "this check failed."
export type RuleOutcome = 'pass' | 'fail' | 'skip';

export interface RuleEvaluation {
  outcome: RuleOutcome;
  evidence: Record<string, unknown>;
}

export interface Rule<TInput> {
  readonly id: string;
  readonly version: string;
  readonly category: string;
  readonly sourceEngine: string;
  evaluate(input: TInput): RuleEvaluation;
}
