import type { OptimizationItem, RuleExplanation } from '@ai-visibility/contracts';
import { Badge, Card, EmptyState } from '../../../components/ui';
import { RecommendationExplainability } from '../../../components/recommendation-explainability';
import type { PageDetailSection } from './page-detail';

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

function EvidenceBlock({ rules }: { rules: RuleExplanation[] }) {
  return (
    <div>
      <p className="text-secondary">Evidence</p>
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

function RecommendationsBlock({ recommendations, rules }: { recommendations: OptimizationItem[]; rules: RuleExplanation[] }) {
  if (recommendations.length === 0) {
    return (
      <div>
        <p className="text-secondary">Recommendations</p>
        <p className="text-tertiary">None — nothing failed in this section.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-secondary">Recommendations</p>
      <div className="stack-sm">
        {recommendations.map((item, index) => (
          <Card key={`${item.title}-${index}`} muted>
            <div className="card__header">
              <h4>{item.title}</h4>
              <Badge>{item.priority}</Badge>
            </div>
            <p>{item.description}</p>
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
export function DetailSectionCard({ section }: { section: PageDetailSection }) {
  if (section.rules.length === 0) {
    return (
      <Card title={section.title}>
        <EmptyState title="No data" description="No Rule evaluated this section for this Audit." />
      </Card>
    );
  }

  const passed = section.rules.filter((rule) => rule.classification === 'passed');
  const issues = section.rules.filter((rule) => rule.classification === 'issue');
  const warnings = section.rules.filter((rule) => rule.classification === 'warning');
  const skipped = section.rules.filter((rule) => rule.classification === 'skipped');

  return (
    <Card title={section.title}>
      <div className="stack">
        <RuleGroup label="Issues" rules={issues} />
        <RuleGroup label="Warnings" rules={warnings} />
        <RuleGroup label="Passed Checks" rules={passed} />
        <RuleGroup label="Skipped (Rule did not run)" rules={skipped} />
        <EvidenceBlock rules={section.rules} />
        <RecommendationsBlock recommendations={section.recommendations} rules={section.rules} />
      </div>
    </Card>
  );
}
