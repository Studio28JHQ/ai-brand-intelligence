import type { AuditAnalysisView, OptimizationItem, RuleExplanation } from '@ai-visibility/contracts';

export interface PageDetailSection {
  key: string;
  title: string;
  rules: RuleExplanation[];
  recommendations: OptimizationItem[];
}

// Every section below is backed by one or two real Analysis Rules (see
// `services/analysis/src/rules/rule-registry.ts`) — this is the one place that maps this
// screen's topic-organized sections onto the ruleIds that already exist. No new Rule is
// introduced for any of these; a topic with no backing Rule (External Links) is deliberately
// left out of this list rather than assigned a fabricated one.
const SECTION_DEFINITIONS: ReadonlyArray<{ key: string; title: string; ruleIds: string[] }> = [
  { key: 'metadata', title: 'Metadata', ruleIds: ['seo-metadata-quality'] },
  { key: 'headings', title: 'Headings', ruleIds: ['seo-heading-structure'] },
  { key: 'content', title: 'Content', ruleIds: ['seo-content-depth'] },
  { key: 'images', title: 'Images', ruleIds: ['seo-image-accessibility'] },
  { key: 'structured-data', title: 'Structured Data', ruleIds: ['seo-structured-data'] },
  { key: 'technical', title: 'Technical', ruleIds: ['seo-security-posture', 'seo-technical-foundation'] },
  { key: 'performance', title: 'Performance', ruleIds: ['seo-performance-estimate'] },
  { key: 'internal-links', title: 'Internal Links', ruleIds: ['seo-internal-linking'] },
];

function allRules(analysis: AuditAnalysisView): RuleExplanation[] {
  const { seo, aiVisibility, technical, content, accessibility, performance } = analysis.scores;
  return [...seo.rules, ...aiVisibility.rules, ...technical.rules, ...content.rules, ...accessibility.rules, ...performance.rules];
}

export function findRuleByRuleId(analysis: AuditAnalysisView, ruleId: string): RuleExplanation | undefined {
  return allRules(analysis).find((rule) => rule.finding.ruleId === ruleId);
}

export function findSignalByKey(rule: RuleExplanation | undefined, key: string) {
  return rule?.signals.find((signal) => signal.key === key);
}

export function recommendationsFor(analysis: AuditAnalysisView, findingIds: ReadonlyArray<string>): OptimizationItem[] {
  return analysis.optimizationPlan.filter((item) => item.supportingFindingIds.some((id) => findingIds.includes(id)));
}

export function buildDetailSections(analysis: AuditAnalysisView): PageDetailSection[] {
  return SECTION_DEFINITIONS.map(({ key, title, ruleIds }) => {
    const rules = ruleIds
      .map((ruleId) => findRuleByRuleId(analysis, ruleId))
      .filter((rule): rule is RuleExplanation => rule !== undefined);
    const recommendations = recommendationsFor(
      analysis,
      rules.map((rule) => rule.finding.id),
    );
    return { key, title, rules, recommendations };
  });
}

// External Links has no backing Analysis Rule today (only `internal-linking-health` exists) — its
// real count is still available as a Signal (`link-counts.data.externalLinkCount`, the same
// Signal `seo-internal-linking`'s Rule reads), surfaced honestly as signal-only data rather than
// a fabricated pass/fail check.
export function externalLinkCount(analysis: AuditAnalysisView): number | null {
  const internalLinkingRule = findRuleByRuleId(analysis, 'seo-internal-linking');
  const linkCountsSignal = findSignalByKey(internalLinkingRule, 'link-counts');
  const value = linkCountsSignal?.data.externalLinkCount;
  return typeof value === 'number' ? value : null;
}

export function externalLinksSignal(analysis: AuditAnalysisView) {
  const internalLinkingRule = findRuleByRuleId(analysis, 'seo-internal-linking');
  return findSignalByKey(internalLinkingRule, 'link-counts');
}
