import type { Translator } from '@ai-visibility/i18n';

// Resolves a Rule's localized title/rationale/resolutionStrategy from its stable `ruleId` —
// the `rules` i18n domain (`catalog.<ruleId>.*`) is the single source both Finding display and
// Optimization Item display draw from, so the same ruleId never renders two different texts.
export function ruleTitle(tRules: Translator, ruleId: string): string {
  return tRules(`catalog.${ruleId}.title`);
}

export function ruleRationale(tRules: Translator, ruleId: string): string {
  return tRules(`catalog.${ruleId}.rationale`);
}

export function ruleResolutionStrategy(tRules: Translator, ruleId: string): string {
  return tRules(`catalog.${ruleId}.resolutionStrategy`);
}

export function assumptionDescription(tRules: Translator, code: string): string {
  return tRules(`assumptions.${code}`);
}
