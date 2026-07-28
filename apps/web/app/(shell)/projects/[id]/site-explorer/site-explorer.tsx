'use client';

import { useMemo, useState } from 'react';
import type { ProjectPage } from '@ai-visibility/contracts';
import { EmptyState } from '../../../../components/ui';
import { useTranslations } from '../../../../../lib/i18n/client';
import { buildSiteTree } from './site-tree';
import { SiteTreeView } from './site-tree-view';
import { SitePagesList } from './site-pages-list';
import { DEFAULT_FILTERS, ISSUE_FILTER_KEYS, getIssueFilterLabels, pageMatchesFilters } from './filters';
import type { IssueFilterKey, ScoreBucket, SiteExplorerFilters } from './filters';

type ViewMode = 'tree' | 'list';

export function SiteExplorer({ siteLabel, pages }: { siteLabel: string; pages: ProjectPage[] }) {
  const t = useTranslations('pages');
  const tCommon = useTranslations('common');
  const tFindings = useTranslations('findings');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [filters, setFilters] = useState<SiteExplorerFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const issueFilterLabels = getIssueFilterLabels(t);
  const statuses = useMemo(() => Array.from(new Set(pages.map((page) => page.status))).sort(), [pages]);

  const visiblePages = useMemo(() => pages.filter((page) => pageMatchesFilters(page, filters)), [pages, filters]);
  const tree = useMemo(() => buildSiteTree(visiblePages), [visiblePages]);

  function toggleSelect(auditId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(auditId)) {
        next.delete(auditId);
      } else {
        next.add(auditId);
      }
      return next;
    });
  }

  function toggleIssueFilter(key: IssueFilterKey) {
    setFilters((current) => {
      const next = new Set(current.issues);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return { ...current, issues: next };
    });
  }

  if (pages.length === 0) {
    return <EmptyState title={t('noPagesYet')} description={t('noPagesExploreDescription')} />;
  }

  return (
    <div className="stack">
      <div className="form-row">
        <div className="field">
          <label htmlFor="site-explorer-search">{t('searchLabel')}</label>
          <input
            id="site-explorer-search"
            className="input"
            type="search"
            placeholder={t('filterByUrlPlaceholder')}
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="site-explorer-status">{tCommon('status')}</label>
          <select
            id="site-explorer-status"
            className="select"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="all">{t('allStatuses')}</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="site-explorer-priority">{t('priority')}</label>
          <select
            id="site-explorer-priority"
            className="select"
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="all">{t('allPriorities')}</option>
            <option value="high">{tCommon('statusValues.high')}</option>
            <option value="medium">{tCommon('statusValues.medium')}</option>
            <option value="low">{tCommon('statusValues.low')}</option>
            <option value="none">{t('none')}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="site-explorer-score">{t('score')}</label>
          <select
            id="site-explorer-score"
            className="select"
            value={filters.scoreBucket}
            onChange={(event) =>
              setFilters((current) => ({ ...current, scoreBucket: event.target.value as ScoreBucket }))
            }
          >
            <option value="all">{t('allScores')}</option>
            <option value="high">{t('scoreHigh')}</option>
            <option value="medium">{t('scoreMedium')}</option>
            <option value="low">{t('scoreLow')}</option>
            <option value="insufficient">{tFindings('insufficientData')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('view')}</label>
          <div className="cluster">
            <button
              type="button"
              className={viewMode === 'tree' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setViewMode('tree')}
            >
              {t('treeView')}
            </button>
            <button
              type="button"
              className={viewMode === 'list' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setViewMode('list')}
            >
              {t('listView')}
            </button>
          </div>
        </div>
      </div>

      <div className="field">
        <label>{t('filterByIssue')}</label>
        <div className="cluster">
          {ISSUE_FILTER_KEYS.map((key) => (
            <label key={key} className="site-explorer__issue-toggle">
              <input type="checkbox" checked={filters.issues.has(key)} onChange={() => toggleIssueFilter(key)} />
              {issueFilterLabels[key]}
            </label>
          ))}
          <label className="site-explorer__issue-toggle" title={t('brokenLinksNotAvailableTitle')}>
            <input type="checkbox" disabled />
            <span className="text-tertiary">{t('brokenLinksNotAvailable')}</span>
          </label>
        </div>
      </div>

      <div className="cluster">
        <span className="text-secondary">{t('selectedCount', { count: selected.size })}</span>
        {selected.size > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
            {t('clearSelection')}
          </button>
        )}
        <span className="text-tertiary">{t('showingOfPages', { visible: visiblePages.length, total: pages.length })}</span>
      </div>

      {viewMode === 'tree' ? (
        <SiteTreeView siteLabel={siteLabel} nodes={tree} selected={selected} onToggleSelect={toggleSelect} />
      ) : (
        <SitePagesList pages={visiblePages} selected={selected} onToggleSelect={toggleSelect} />
      )}
    </div>
  );
}
