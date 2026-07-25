import { RuleRegistry } from '@ai-visibility/rules';
import type { Finding } from '@ai-visibility/contracts';
import { createOutcomeImpactRule } from './outcome-impact.rule';

export function buildClassificationRuleRegistry(): RuleRegistry<Finding> {
  const registry = new RuleRegistry<Finding>();

  registry.register(createOutcomeImpactRule());

  return registry;
}
