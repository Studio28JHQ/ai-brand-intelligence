import type { OptimizationItem, RuleExplanation, Scores } from '@ai-visibility/contracts';

const SCORE_KEYS = ['seo', 'aiVisibility', 'technical', 'content', 'accessibility', 'performance'] as const;

function allRuleExplanations(scores: Scores): RuleExplanation[] {
  return SCORE_KEYS.flatMap((key) => scores[key].rules);
}

// Every real Optimization Item is generated from exactly one Finding (`generateOptimizationPlan`
// dedupes by ruleId, one Item per failing Rule) — this looks that Finding's full explainability
// chain back up from the already-computed Scores rather than recomputing anything.
export function findRuleExplanationForItem(scores: Scores, item: OptimizationItem): RuleExplanation | undefined {
  return allRuleExplanations(scores).find((rule) => item.supportingFindingIds.includes(rule.finding.id));
}
