import { OPTIMIZATION_RULE_CATALOG } from './optimization-rule.catalog';
import type { OptimizationRuleDefinition, OptimizationRuleVersion } from './optimization-rule';

export function currentVersion(definition: OptimizationRuleDefinition): OptimizationRuleVersion {
  return definition.versions[definition.versions.length - 1];
}

export function resolveOptimizationRule(ruleId: string): OptimizationRuleVersion | null {
  const definition = OPTIMIZATION_RULE_CATALOG.find((rule) => rule.ruleId === ruleId);
  if (!definition || !definition.enabled) {
    return null;
  }
  return currentVersion(definition);
}

export function listOptimizationRules(): OptimizationRuleDefinition[] {
  return OPTIMIZATION_RULE_CATALOG;
}
