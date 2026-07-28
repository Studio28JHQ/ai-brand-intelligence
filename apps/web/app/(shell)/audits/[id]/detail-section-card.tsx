import type { OptimizationItem, RuleExplanation } from '@ai-visibility/contracts';
import { Badge, Card, EmptyState, statusToVariant } from '../../../components/ui';
import { RecommendationExplainability } from '../../../components/recommendation-explainability';
import type { PageDetailSection } from './page-detail';
import { getTranslations } from '../../../../lib/i18n/server';
import type { Translator } from '@ai-visibility/i18n';
import { ruleResolutionStrategy, ruleTitle } from '../../../lib/rule-text';

function findRuleForItem(rules: RuleExplanation[], item: OptimizationItem): RuleExplanation | undefined {
  return rules.find((rule) => item.supportingFindingIds.includes(rule.finding.id));
}

function RuleLabel({ rule }: { rule: RuleExplanation }) {
  return (
    <span>
      {rule.finding.ruleId} <span className="text-tertiary">v{rule.finding.ruleVersion}</span>
    </span>
  );
}

function RuleGroup({ label, rules }: { label: string; rules: RuleExplanation[] }) {
  if (rules.length === 0) {
    return null;
  }
  return (
    <div>
      <p className="text-secondary">{label}</p>
      <ul>
        {rules.map((rule) => (
          <li key={rule.finding.id}>
            <RuleLabel rule={rule} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvidenceBlock({ rules, label }: { rules: RuleExplanation[]; label: string }) {
  return (
    <div>
      <p className="text-secondary">{label}</p>
      <div className="stack-sm">
        {rules.map((rule) => (
          <div key={rule.finding.id}>
            <p className="text-tertiary">
              <RuleLabel rule={rule} />
            </p>
            <pre className="text-mono">{JSON.stringify(rule.finding.evidence, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsBlock({
  recommendations,
  rules,
  t,
  tCommon,
  tRules,
}: {
  recommendations: OptimizationItem[];
  rules: RuleExplanation[];
  t: Translator;
  tCommon: Translator;
  tRules: Translator;
}) {
  if (recommendations.length === 0) {
    return (
      <div>
        <p className="text-secondary">{t('recommendations')}</p>
        <p className="text-tertiary">{t('noneNothingFailed')}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-secondary">{t('recommendations')}</p>
      <div className="stack-sm">
        {recommendations.map((item, index) => (
          <Card key={`${item.optimizationRuleId}-${index}`} muted>
            <div className="card__header">
              <h4>{ruleTitle(tRules, item.optimizationRuleId)}</h4>
              <Badge variant={statusToVariant(item.priority)}>{tCommon(`statusValues.${item.priority}`)}</Badge>
            </div>
            <p>{ruleResolutionStrategy(tRules, item.optimizationRuleId)}</p>
            <RecommendationExplainability item={item} rule={findRuleForItem(rules, item)} />
          </Card>
        ))}
      </div>
    </div>
  );
}

// Every section is backed by real Rules only — Issues/Warnings/Passed Checks/Skipped are shown
// exactly as the deterministic engine classified them (never hidden, never re-bucketed), Evidence
// is each Rule's own Finding.evidence verbatim, and Recommendations are the real Optimization Plan
// items whose supportingFindingIds reference one of this section's Findings.
export async function DetailSectionCard({ section }: { section: PageDetailSection }) {
  const t = await getTranslations('audits');
  const tFindings = await getTranslations('findings');
  const tCommon = await getTranslations('common');
  const tRules = await getTranslations('rules');
  const sectionTitle = t(`sections.${section.key}`);

  if (section.rules.length === 0) {
    return (
      <Card title={sectionTitle}>
        <EmptyState title={t('noDataTitle')} description={t('noRuleEvaluatedSection')} />
      </Card>
    );
  }

  const passed = section.rules.filter((rule) => rule.classification === 'passed');
  const issues = section.rules.filter((rule) => rule.classification === 'issue');
  const warnings = section.rules.filter((rule) => rule.classification === 'warning');
  const skipped = section.rules.filter((rule) => rule.classification === 'skipped');

  return (
    <Card title={sectionTitle}>
      <div className="stack">
        <RuleGroup label={t('issuesLabel')} rules={issues} />
        <RuleGroup label={t('warningsLabel')} rules={warnings} />
        <RuleGroup label={t('passedChecksLabel')} rules={passed} />
        <RuleGroup label={t('skippedLabel')} rules={skipped} />
        <EvidenceBlock rules={section.rules} label={tFindings('evidence')} />
        <RecommendationsBlock
          recommendations={section.recommendations}
          rules={section.rules}
          t={t}
          tCommon={tCommon}
          tRules={tRules}
        />
      </div>
    </Card>
  );
}
