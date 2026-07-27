import type { CategoryScore, Scores } from '@ai-visibility/contracts';
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
    <p className="text-secondary">
      {category.evaluatedRules} evaluated ({category.passedRules} passed, {category.failedRules} failed
      {category.skippedRules > 0 ? `, ${category.skippedRules} skipped` : ''})
    </p>
  );
}

export function ScoresPanel({ scores }: { scores: Scores }) {
  return (
    <Card
      title="Scores"
      description="Deterministic, heuristic scores computed from this audit's Findings — no AI provider required."
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
