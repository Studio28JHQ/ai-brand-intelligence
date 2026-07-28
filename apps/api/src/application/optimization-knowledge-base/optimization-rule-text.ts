import { createTranslator } from '@ai-visibility/i18n';

// English-only internal text resolution for backend-generated content that is not part of this
// platform's localization surface: the AI Daily Briefing and the AI Consultant (both deterministic,
// no LLM — see `docs/04_PROJECT/DECISION_LOG.md#cto-066` — but explicitly out of scope for
// `F10-S05D`'s per-request localization, per `docs/04_PROJECT/DECISION_LOG.md#cto-111`). Draws from
// the same `rules` i18n domain the presentation layer resolves for every locale, so this is never a
// second, duplicated copy of the English text — just a fixed-locale read of the one source.
const resolveEnglishRuleMessage = createTranslator('en', 'rules');

export interface RuleText {
  title: string;
  rationale: string;
  resolutionStrategy: string;
}

export function resolveRuleText(ruleId: string): RuleText {
  return {
    title: resolveEnglishRuleMessage(`catalog.${ruleId}.title`),
    rationale: resolveEnglishRuleMessage(`catalog.${ruleId}.rationale`),
    resolutionStrategy: resolveEnglishRuleMessage(`catalog.${ruleId}.resolutionStrategy`),
  };
}

export function resolveEnglishMessage(key: string, params?: Record<string, string | number>): string {
  return resolveEnglishRuleMessage(key, params);
}
