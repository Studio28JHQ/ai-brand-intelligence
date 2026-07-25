import type { FindingSeverity, RuleOutcome } from '@ai-visibility/contracts';

export function classifySeverity(outcome: RuleOutcome): FindingSeverity {
  return outcome === 'fail' ? 'warning' : 'none';
}
