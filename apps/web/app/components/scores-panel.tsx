import type { AnalysisSignal, CategoryScore, Finding, RuleExplanation, Scores } from '@ai-visibility/contracts';
import { Badge, Card } from './ui';

const CATEGORY_LABELS: Record<Exclude<keyof Scores, 'overall'>, string> = {
  seo: 'SEO',
  aiVisibility: 'AI Visibility',
  technical: 'Technical',
  content: 'Content',
  accessibility: 'Accessibility',
  performance: 'Performance',
};

const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as Array<Exclude<keyof Scores, 'overall'>>;

function scoreVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Badge variant="neutral">Insufficient Data</Badge>;
  }
  return <Badge variant={scoreVariant(score)}>{`${score}/100`}</Badge>;
}

function CoverageLine({ category }: { category: CategoryScore }) {
  return (
    <dl className="dl">
      <dt>Total Rules</dt>
      <dd>{category.totalRules}</dd>
      <dt>Evaluated</dt>
      <dd>{category.evaluatedRules}</dd>
      <dt>Passed</dt>
      <dd>{category.passedRules}</dd>
      <dt>Failed</dt>
      <dd>{category.failedRules}</dd>
      <dt>Skipped</dt>
      <dd>{category.skippedRules}</dd>
    </dl>
  );
}

function SignalCard({ signal }: { signal: AnalysisSignal }) {
  return (
    <div className="score-explain__signal">
      <p>
        <strong>{signal.key}</strong> <span className="text-tertiary">({signal.category}, via {signal.sourceId})</span>
      </p>
      <pre className="text-mono">{JSON.stringify(signal.data, null, 2)}</pre>
    </div>
  );
}

function FindingExplanation({ finding }: { finding: Finding }) {
  return (
    <>
      <div className="score-explain__layer">
        <p className="score-explain__label">Finding</p>
        <p className="text-secondary">
          {finding.id} — outcome <Badge>{finding.outcome}</Badge> — severity <Badge>{finding.severity}</Badge>
        </p>
      </div>
      <div className="score-explain__layer">
        <p className="score-explain__label">Evidence</p>
        <pre className="text-mono">{JSON.stringify(finding.evidence, null, 2)}</pre>
      </div>
    </>
  );
}

function RuleExplanationCard({ rule }: { rule: RuleExplanation }) {
  const { finding, signals } = rule;
  return (
    <div className="score-explain__rule">
      <p>
        <strong>{finding.ruleId}</strong> <span className="text-tertiary">v{finding.ruleVersion}</span>{' '}
        <Badge>{finding.outcome}</Badge>
      </p>
      <FindingExplanation finding={finding} />
      <div className="score-explain__layer">
        <p className="score-explain__label">Signals ({signals.length})</p>
        {signals.length === 0 ? (
          <p className="text-secondary">
            No Signals to show — this Rule's Heuristic did not run, so there is nothing real to attribute.
          </p>
        ) : (
          signals.map((signal) => <SignalCard key={signal.signalId} signal={signal} />)
        )}
      </div>
    </div>
  );
}

function CategoryExplainability({ category }: { category: CategoryScore }) {
  if (category.rules.length === 0) {
    return null;
  }
  return (
    <details className="score-card__expand">
      <summary>Rules → Findings → Evidence → Signals ({category.rules.length})</summary>
      <div className="score-explain">
        {category.rules.map((rule) => (
          <RuleExplanationCard key={rule.finding.id} rule={rule} />
        ))}
      </div>
    </details>
  );
}

export function ScoresPanel({ scores }: { scores: Scores }) {
  return (
    <Card
      title="Scores"
      description="Deterministic, heuristic scores computed from this audit's Findings — no AI provider required. Expand any category to see exactly which Rules, Findings, Evidence, and Signals produced its score."
      actions={
        <Badge variant={scores.overall === null ? 'neutral' : scoreVariant(scores.overall)}>
          {scores.overall === null ? 'Insufficient Data' : `${scores.overall}/100 Overall`}
        </Badge>
      }
    >
      <div className="grid-3">
        {CATEGORY_KEYS.map((key) => {
          const category = scores[key];
          return (
            <Card key={key} muted title={CATEGORY_LABELS[key]} actions={<ScoreBadge score={category.score} />}>
              <CoverageLine category={category} />
              {category.status === 'incomplete' && (
                <p className="text-secondary">
                  Status: Incomplete — fewer than the minimum number of checks were evaluated for this category.
                </p>
              )}
              {category.status === 'insufficient-data' && (
                <p className="text-secondary">No checks were evaluated for this category yet.</p>
              )}
              {category.issues.length === 0 && category.warnings.length === 0 && category.evaluatedRules > 0 && (
                <p className="text-secondary">No issues found — {category.passedChecks.length} check(s) passed.</p>
              )}
              {category.issues.length > 0 && (
                <div>
                  <p className="text-secondary">Issues</p>
                  <ul>
                    {category.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {category.warnings.length > 0 && (
                <div>
                  <p className="text-secondary">Warnings</p>
                  <ul>
                    {category.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              <CategoryExplainability category={category} />
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

export function ScoresSummaryBadge({ scores }: { scores: Scores | null }) {
  if (!scores || scores.overall === null) {
    return <Badge variant="neutral">No score yet</Badge>;
  }
  return <Badge variant={scoreVariant(scores.overall)}>{`${scores.overall}/100`}</Badge>;
}
