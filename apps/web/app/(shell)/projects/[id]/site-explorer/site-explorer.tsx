'use client';

import { useMemo, useState } from 'react';
import type { ProjectPage } from '@ai-visibility/contracts';
import { EmptyState } from '../../../../components/ui';
import { buildSiteTree } from './site-tree';
import { SiteTreeView } from './site-tree-view';
import { SitePagesList } from './site-pages-list';
import { DEFAULT_FILTERS, ISSUE_FILTER_KEYS, ISSUE_FILTER_LABELS, pageMatchesFilters } from './filters';
import type { IssueFilterKey, ScoreBucket, SiteExplorerFilters } from './filters';

type ViewMode = 'tree' | 'list';

export function SiteExplorer({ siteLabel, pages }: { siteLabel: string; pages: ProjectPage[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [filters, setFilters] = useState<SiteExplorerFilters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

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
    return <EmptyState title="No Pages yet" description="Run an Audit for this Project to explore its site here." />;
  }

  return (
    <div className="stack">
      <div className="form-row">
        <div className="field">
          <label htmlFor="site-explorer-search">Search</label>
          <input
            id="site-explorer-search"
            className="input"
            type="search"
            placeholder="Filter by URL…"
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
          />
        </div>
        <div className="field">
          <label htmlFor="site-explorer-status">Status</label>
          <select
            id="site-explorer-status"
            className="select"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="site-explorer-priority">Priority</label>
          <select
            id="site-explorer-priority"
            className="select"
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="site-explorer-score">Score</label>
          <select
            id="site-explorer-score"
            className="select"
            value={filters.scoreBucket}
            onChange={(event) =>
              setFilters((current) => ({ ...current, scoreBucket: event.target.value as ScoreBucket }))
            }
          >
            <option value="all">All scores</option>
            <option value="high">High (80–100)</option>
            <option value="medium">Medium (50–79)</option>
            <option value="low">Low (0–49)</option>
            <option value="insufficient">Insufficient Data</option>
          </select>
        </div>
        <div className="field">
          <label>View</label>
          <div className="cluster">
            <button
              type="button"
              className={viewMode === 'tree' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setViewMode('tree')}
            >
              Tree View
            </button>
            <button
              type="button"
              className={viewMode === 'list' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      <div className="field">
        <label>Filter by Issue</label>
        <div className="cluster">
          {ISSUE_FILTER_KEYS.map((key) => (
            <label key={key} className="site-explorer__issue-toggle">
              <input type="checkbox" checked={filters.issues.has(key)} onChange={() => toggleIssueFilter(key)} />
              {ISSUE_FILTER_LABELS[key]}
            </label>
          ))}
          <label className="site-explorer__issue-toggle" title="No Analysis Rule follows outbound links yet — there is no real data to filter on.">
            <input type="checkbox" disabled />
            <span className="text-tertiary">Broken Links (not available)</span>
          </label>
        </div>
      </div>

      <div className="cluster">
        <span className="text-secondary">
          {selected.size} selected
        </span>
        {selected.size > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
            Clear selection
          </button>
        )}
        <span className="text-tertiary">
          Showing {visiblePages.length} of {pages.length} Pages
        </span>
      </div>

      {viewMode === 'tree' ? (
        <SiteTreeView siteLabel={siteLabel} nodes={tree} selected={selected} onToggleSelect={toggleSelect} />
      ) : (
        <SitePagesList pages={visiblePages} selected={selected} onToggleSelect={toggleSelect} />
      )}
    </div>
  );
}
