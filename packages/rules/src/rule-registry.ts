import { Rule } from './rule';

export class RuleRegistry<TInput> {
  private readonly rules: Rule<TInput>[] = [];

  register(rule: Rule<TInput>): void {
    this.rules.push(rule);
  }

  getAll(): ReadonlyArray<Rule<TInput>> {
    return this.rules;
  }
}
