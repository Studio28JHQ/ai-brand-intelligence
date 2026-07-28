import type { OptimizationLevel } from '@ai-visibility/contracts';

// No title/businessRationale/resolutionStrategy here: this is the Business Module Layer's
// structural rule metadata only (severity/impact/evidence shape), never translated English text.
// `ruleId` is the stable semantic identifier the presentation layer resolves into localized
// title/rationale/resolutionStrategy via the `rules` i18n domain (`packages/i18n/locales/*/rules.json`,
// `catalog.<ruleId>.*`) — see `docs/04_PROJECT/DECISION_LOG.md#cto-111`.
export interface OptimizationRuleVersion {
  ruleId: string;
  version: string;
  category: string;
  severity: OptimizationLevel;
  expectedImpact: OptimizationLevel;
  evidenceReferences: string[];
  publishedAt: string;
}

export interface OptimizationRuleDefinition {
  ruleId: string;
  enabled: boolean;
  // Append-only, oldest first — the last entry is always the current version.
  versions: OptimizationRuleVersion[];
}
