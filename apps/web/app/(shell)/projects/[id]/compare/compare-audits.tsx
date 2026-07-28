'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CategoryScoreComparison, PageAuditHistoryEntry, PageComparisonResult, ProjectPage, ScoreTrend } from '@ai-visibility/contracts';
import { Badge, Card, EmptyState, statusToVariant } from '../../../../components/ui';
import { comparePages, getPageAuditHistory } from '../../../../actions';
import { useTranslations } from '../../../../../lib/i18n/client';
import type { Translator } from '@ai-visibility/i18n';
import { ruleResolutionStrategy, ruleTitle } from '../../../../lib/rule-text';

function trendVariant(trend: ScoreTrend): 'success' | 'danger' | 'neutral' {
  if (trend === 'improved') return 'success';
  if (trend === 'declined') return 'danger';
  return 'neutral';
}

function trendLabel(trend: ScoreTrend, t: Translator): string {
  if (trend === 'improved') return t('trendImproved');
  if (trend === 'declined') return t('trendDeclined');
  if (trend === 'unchanged') return t('trendUnchanged');
  return t('trendUnknown');
}

function scoreLabel(score: number | null, tFindings: Translator): string {
  return score === null ? tFindings('insufficientData') : `${score}/100`;
}

function deltaLabel(delta: number | null): string {
  if (delta === null) return '—';
  if (delta > 0) return `+${delta}`;
  return `${delta}`;
}

const CATEGORY_KEYS: Record<string, string> = {
  seo: 'categorySeo',
  aiVisibility: 'categoryAiVisibility',
  technical: 'categoryTechnical',
  content: 'categoryContent',
  accessibility: 'categoryAccessibility',
  performance: 'categoryPerformance',
};

function categoryLabel(category: string, t: Translator, tFindings: Translator): string {
  if (category === 'overall') return t('categoryOverall');
  const key = CATEGORY_KEYS[category];
  return key ? tFindings(key) : category;
}

function ScoreRow({ row, t, tFindings }: { row: CategoryScoreComparison; t: Translator; tFindings: Translator }) {
  return (
    <tr className={row.trend === 'improved' ? 'compare-row--improved' : row.trend === 'declined' ? 'compare-row--declined' : ''}>
      <td>{categoryLabel(row.category, t, tFindings)}</td>
      <td>{scoreLabel(row.oldScore, tFindings)}</td>
      <td>{scoreLabel(row.newScore, tFindings)}</td>
      <td>{deltaLabel(row.delta)}</td>
      <td>
        <Badge variant={trendVariant(row.trend)}>{trendLabel(row.trend, t)}</Badge>
      </td>
    </tr>
  );
}

function IssueList({
  title,
  issues,
  emptyLabel,
  tRules,
}: {
  title: string;
  issues: PageComparisonResult['newIssues'];
  emptyLabel: string;
  tRules: Translator;
}) {
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
              {ruleTitle(tRules, issue.ruleId)} <span className="text-tertiary">({issue.ruleId})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ComparisonResultView({
  result,
  t,
  tFindings,
  tOptimization,
  tCommon,
  tRules,
}: {
  result: PageComparisonResult;
  t: Translator;
  tFindings: Translator;
  tOptimization: Translator;
  tCommon: Translator;
  tRules: Translator;
}) {
  const overall = result.scores.find((row) => row.category === 'overall');
  const categoryRows = result.scores.filter((row) => row.category !== 'overall');
  const notApplicable = tCommon('unknown');

  return (
    <div className="stack">
      <Card
        title={t('trendTitle')}
        actions={overall && <Badge variant={trendVariant(overall.trend)}>{trendLabel(overall.trend, t)}</Badge>}
      >
        <dl className="dl">
          <dt>{t('pageLabel')}</dt>
          <dd className="text-mono">{result.url}</dd>
          <dt>{t('oldAudit')}</dt>
          <dd>
            {result.baselineAuditId} ({result.baselineAuditAt ?? notApplicable})
          </dd>
          <dt>{t('newAudit')}</dt>
          <dd>
            {result.targetAuditId} ({result.targetAuditAt ?? notApplicable})
          </dd>
          <dt>{t('oldScore')}</dt>
          <dd>{overall ? scoreLabel(overall.oldScore, tFindings) : notApplicable}</dd>
          <dt>{t('newScore')}</dt>
          <dd>{overall ? scoreLabel(overall.newScore, tFindings) : notApplicable}</dd>
          <dt>{t('delta')}</dt>
          <dd>{overall ? deltaLabel(overall.delta) : notApplicable}</dd>
        </dl>
      </Card>

      <Card title={t('scoresByCategory')} description={t('scoresByCategoryDescription')}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>{t('categoryColumn')}</th>
                <th>{t('oldScore')}</th>
                <th>{t('newScore')}</th>
                <th>{t('delta')}</th>
                <th>{t('trendColumn')}</th>
              </tr>
            </thead>
            <tbody>
              {categoryRows.map((row) => (
                <ScoreRow key={row.category} row={row} t={t} tFindings={tFindings} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={t('issuesTitle')}>
        <div className="stack">
          <IssueList title={t('newIssues')} issues={result.newIssues} emptyLabel={t('noNewIssues')} tRules={tRules} />
          <IssueList title={t('resolvedIssues')} issues={result.resolvedIssues} emptyLabel={t('noResolvedIssues')} tRules={tRules} />
          <IssueList
            title={t('persistentIssues')}
            issues={result.persistentIssues}
            emptyLabel={t('noPersistentIssues')}
            tRules={tRules}
          />
        </div>
      </Card>

      <Card title={tOptimization('title')} description={t('recommendationsDescription')}>
        {result.recommendations.length === 0 ? (
          <EmptyState title={tOptimization('noOptimizationItems')} />
        ) : (
          <div className="stack">
            {result.recommendations.map((item, index) => (
              <Card key={`${item.optimizationRuleId}-${index}`} muted>
                <div className="card__header">
                  <h4>{ruleTitle(tRules, item.optimizationRuleId)}</h4>
                  <Badge variant={statusToVariant(item.priority)}>{tCommon(`statusValues.${item.priority}`)}</Badge>
                </div>
                <p>{ruleResolutionStrategy(tRules, item.optimizationRuleId)}</p>
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
  const t = useTranslations('pages');
  const tFindings = useTranslations('findings');
  const tOptimization = useTranslations('optimization');
  const tCommon = useTranslations('common');
  const tRules = useTranslations('rules');

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
      setError(t('compareErrorMessage'));
      setResult(null);
      return;
    }
    setResult(comparison);
  }

  if (pages.length === 0) {
    return <EmptyState title={t('noPagesYet')} description={t('noPagesCompareDescription')} />;
  }

  return (
    <div className="stack">
      <Card title={t('chooseTwoAudits')}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="compare-url">{t('pageLabel')}</label>
            <select id="compare-url" className="select" value={selectedUrl} onChange={(event) => setSelectedUrl(event.target.value)}>
              {pages.map((page) => (
                <option key={page.url} value={page.url}>
                  {page.url}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="compare-baseline">{t('oldAudit')}</label>
            <select
              id="compare-baseline"
              className="select"
              value={baselineAuditId}
              onChange={(event) => setBaselineAuditId(event.target.value)}
            >
              <option value="">{t('selectAnAudit')}</option>
              {history.map((entry) => (
                <option key={entry.auditId} value={entry.auditId}>
                  {entry.completedAt ?? entry.createdAt} ({entry.auditId.slice(0, 8)})
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="compare-target">{t('newAudit')}</label>
            <select
              id="compare-target"
              className="select"
              value={targetAuditId}
              onChange={(event) => setTargetAuditId(event.target.value)}
            >
              <option value="">{t('selectAnAudit')}</option>
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
              {loading ? t('comparing') : t('compare')}
            </button>
          </div>
        </div>
        {history.length < 2 && selectedUrl && <p className="text-tertiary">{t('fewerThanTwoAudits')}</p>}
        {error && <p className="text-secondary">{error}</p>}
      </Card>

      {result && (
        <ComparisonResultView
          result={result}
          t={t}
          tFindings={tFindings}
          tOptimization={tOptimization}
          tCommon={tCommon}
          tRules={tRules}
        />
      )}
    </div>
  );
}
