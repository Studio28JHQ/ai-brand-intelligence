import { Rule } from './rule';
import { RuleSetVersion } from './rule-set-version';

export class RuleRegistry<TInput> {
  private readonly rules: Rule<TInput>[] = [];

  register(rule: Rule<TInput>): void {
    this.rules.push(rule);
  }

  getAll(): ReadonlyArray<Rule<TInput>> {
    return this.rules;
  }

  getRuleSetVersion(): RuleSetVersion {
    const entries = this.rules.map((rule) => ({ ruleId: rule.id, ruleVersion: rule.version }));
    const version = entries
      .map((entry) => `${entry.ruleId}@${entry.ruleVersion}`)
      .sort()
      .join('+');

    return { version, rules: entries };
  }
}
