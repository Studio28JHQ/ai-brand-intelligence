'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CategoryScoreComparison, PageAuditHistoryEntry, PageComparisonResult, ProjectPage, ScoreTrend } from '@ai-visibility/contracts';
import { Badge, Card, EmptyState } from '../../../../components/ui';
import { comparePages, getPageAuditHistory } from '../../../../actions';

const CATEGORY_LABELS: Record<string, string> = {
  overall: 'Overall',
  seo: 'SEO',
  aiVisibility: 'AI Visibility',
  technical: 'Technical',
  content: 'Content',
  accessibility: 'Accessibility',
  performance: 'Performance',
};

function trendVariant(trend: ScoreTrend): 'success' | 'danger' | 'neutral' {
  if (trend === 'improved') return 'success';
  if (trend === 'declined') return 'danger';
  return 'neutral';
}

function trendLabel(trend: ScoreTrend): string {
  if (trend === 'improved') return '▲ Improved';
  if (trend === 'declined') return '▼ Declined';
  if (trend === 'unchanged') return '— Unchanged';
  return 'Unknown';
}

function scoreLabel(score: number | null): string {
  return score === null ? 'Insufficient Data' : `${score}/100`;
}

function deltaLabel(delta: number | null): string {
  if (delta === null) return '—';
  if (delta > 0) return `+${delta}`;
  return `${delta}`;
}

function ScoreRow({ row }: { row: CategoryScoreComparison }) {
  return (
    <tr className={row.trend === 'improved' ? 'compare-row--improved' : row.trend === 'declined' ? 'compare-row--declined' : ''}>
      <td>{CATEGORY_LABELS[row.category] ?? row.category}</td>
      <td>{scoreLabel(row.oldScore)}</td>
      <td>{scoreLabel(row.newScore)}</td>
      <td>{deltaLabel(row.delta)}</td>
      <td>
        <Badge variant={trendVariant(row.trend)}>{trendLabel(row.trend)}</Badge>
      </td>
    </tr>
  );
}

function IssueList({ title, issues, emptyLabel }: { title: string; issues: PageComparisonResult['newIssues']; emptyLabel: string }) {
  return (
    <div>
      <p className="text-secondary">
        {title} ({issues.length})
      </p>
      {issues.length === 0 ? (
        <p className="text-tertiary">{emptyLabel}</p>
      ) : (
        <ul>
          {issues.map((issue) => (
            <li key={issue.ruleId}>
              {issue.title} <span className="text-tertiary">({issue.ruleId})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ComparisonResultView({ result }: { result: PageComparisonResult }) {
  const overall = result.scores.find((row) => row.category === 'overall');
  const categoryRows = result.scores.filter((row) => row.category !== 'overall');

  return (
    <div className="stack">
      <Card
        title="Trend"
        actions={overall && <Badge variant={trendVariant(overall.trend)}>{trendLabel(overall.trend)}</Badge>}
      >
        <dl className="dl">
          <dt>Page</dt>
          <dd className="text-mono">{result.url}</dd>
          <dt>Old Audit</dt>
          <dd>
            {result.baselineAuditId} ({result.baselineAuditAt ?? 'N/A'})
          </dd>
          <dt>New Audit</dt>
          <dd>
            {result.targetAuditId} ({result.targetAuditAt ?? 'N/A'})
          </dd>
          <dt>Old Score</dt>
          <dd>{overall ? scoreLabel(overall.oldScore) : 'N/A'}</dd>
          <dt>New Score</dt>
          <dd>{overall ? scoreLabel(overall.newScore) : 'N/A'}</dd>
          <dt>Delta</dt>
          <dd>{overall ? deltaLabel(overall.delta) : 'N/A'}</dd>
        </dl>
      </Card>

      <Card title="Scores by Category" description="Green rows improved, red rows regressed between the two Audits.">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Old Score</th>
                <th>New Score</th>
                <th>Delta</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>{categoryRows.map((row) => <ScoreRow key={row.category} row={row} />)}</tbody>
          </table>
        </div>
      </Card>

      <Card title="Issues">
        <div className="stack">
          <IssueList title="New Issues" issues={result.newIssues} emptyLabel="No new issues appeared." />
          <IssueList title="Resolved Issues" issues={result.resolvedIssues} emptyLabel="No issues were resolved." />
          <IssueList title="Persistent Issues" issues={result.persistentIssues} emptyLabel="No issues persisted from the old Audit." />
        </div>
      </Card>

      <Card title="Recommendations" description="Real, current Optimization Plan items for the new Audit.">
        {result.recommendations.length === 0 ? (
          <EmptyState title="No Optimization Items" />
        ) : (
          <div className="stack">
            {result.recommendations.map((item, index) => (
              <Card key={`${item.title}-${index}`} muted>
                <div className="card__header">
                  <h4>{item.title}</h4>
                  <Badge>{item.priority}</Badge>
                </div>
                <p>{item.description}</p>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export function CompareAudits({
  projectId,
  pages,
  initialUrl,
  initialBaselineAuditId,
  initialTargetAuditId,
}: {
  projectId: string;
  pages: ProjectPage[];
  initialUrl?: string;
  initialBaselineAuditId?: string;
  initialTargetAuditId?: string;
}) {
  const [selectedUrl, setSelectedUrl] = useState<string>(initialUrl ?? pages[0]?.url ?? '');
  const [history, setHistory] = useState<PageAuditHistoryEntry[]>([]);
  const [baselineAuditId, setBaselineAuditId] = useState<string>('');
  const [targetAuditId, setTargetAuditId] = useState<string>('');
  const [result, setResult] = useState<PageComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedUrl) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    getPageAuditHistory(projectId, selectedUrl).then((entries) => {
      if (cancelled) return;
      const completed = entries.filter((entry) => entry.status === 'completed');
      setHistory(completed);
      // Arriving here from the Audit History screen's "Compare Selected" action (F10-S04C) already
      // picked two specific Audits — honor that exact choice on this first load rather than
      // defaulting to the two most recent, but only if both really are in this Page's history.
      const preselectedBaseline = completed.find((entry) => entry.auditId === initialBaselineAuditId);
      const preselectedTarget = completed.find((entry) => entry.auditId === initialTargetAuditId);
      setBaselineAuditId(preselectedBaseline?.auditId ?? completed[1]?.auditId ?? '');
      setTargetAuditId(preselectedTarget?.auditId ?? completed[0]?.auditId ?? '');
      setResult(null);
      setError(null);
    });
    return () => {
      cancelled = true;
    };
    // initialBaselineAuditId/initialTargetAuditId are only meant to seed the very first load for
    // this URL, not re-apply every time selectedUrl changes afterward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, selectedUrl]);

  const canCompare = useMemo(
    () => baselineAuditId.length > 0 && targetAuditId.length > 0 && baselineAuditId !== targetAuditId,
    [baselineAuditId, targetAuditId],
  );

  async function handleCompare() {
    setLoading(true);
    setError(null);
    const comparison = await comparePages(baselineAuditId, targetAuditId);
    setLoading(false);
    if (!comparison) {
      setError('Could not compare these two Audits — they may not exist, may not be completed, or may not audit the same URL.');
      setResult(null);
      return;
    }
    setResult(comparison);
  }

  if (pages.length === 0) {
    return <EmptyState title="No Pages yet" description="Run an Audit for this Project before comparing." />;
  }

  return (
    <div className="stack">
      <Card title="Choose two Audits of the same Page">
        <div className="form-row">
          <div className="field">
            <label htmlFor="compare-url">Page</label>
            <select id="compare-url" className="select" value={selectedUrl} onChange={(event) => setSelectedUrl(event.target.value)}>
              {pages.map((page) => (
                <option key={page.url} value={page.url}>
                  {page.url}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="compare-baseline">Old Audit</label>
            <select
              id="compare-baseline"
              className="select"
              value={baselineAuditId}
              onChange={(event) => setBaselineAuditId(event.target.value)}
            >
              <option value="">Select an Audit…</option>
              {history.map((entry) => (
                <option key={entry.auditId} value={entry.auditId}>
                  {entry.completedAt ?? entry.createdAt} ({entry.auditId.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="compare-target">New Audit</label>
            <select
              id="compare-target"
              className="select"
              value={targetAuditId}
              onChange={(event) => setTargetAuditId(event.target.value)}
            >
              <option value="">Select an Audit…</option>
              {history.map((entry) => (
                <option key={entry.auditId} value={entry.auditId}>
                  {entry.completedAt ?? entry.createdAt} ({entry.auditId.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>&nbsp;</label>
            <button type="button" className="btn btn-primary" disabled={!canCompare || loading} onClick={handleCompare}>
              {loading ? 'Comparing…' : 'Compare'}
            </button>
          </div>
        </div>
        {history.length < 2 && selectedUrl && (
          <p className="text-tertiary">This Page has fewer than two completed Audits — run another Audit for it to compare.</p>
        )}
        {error && <p className="text-secondary">{error}</p>}
      </Card>

      {result && <ComparisonResultView result={result} />}
    </div>
  );
}
