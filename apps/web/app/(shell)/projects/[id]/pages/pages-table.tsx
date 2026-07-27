'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ProjectPage } from '@ai-visibility/contracts';
import { Badge, EmptyState } from '../../../../components/ui';

type SortKey = 'url' | 'status' | 'overallScore' | 'seoScore' | 'aiVisibilityScore' | 'lastAuditAt' | 'findingsCount' | 'priority';
type SortDirection = 'asc' | 'desc';

const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

const COLUMNS: Array<{ key: SortKey; label: string }> = [
  { key: 'url', label: 'URL' },
  { key: 'status', label: 'Status' },
  { key: 'overallScore', label: 'Overall Score' },
  { key: 'seoScore', label: 'SEO Score' },
  { key: 'aiVisibilityScore', label: 'AI Visibility Score' },
  { key: 'lastAuditAt', label: 'Last Audit' },
  { key: 'findingsCount', label: 'Findings' },
  { key: 'priority', label: 'Priority' },
];

function scoreCell(score: number | null) {
  return score === null ? <span className="text-tertiary">Insufficient Data</span> : `${score}/100`;
}

function compareValues(a: ProjectPage, b: ProjectPage, key: SortKey): number {
  switch (key) {
    case 'url':
    case 'status':
      return a[key].localeCompare(b[key]);
    case 'overallScore':
    case 'seoScore':
    case 'aiVisibilityScore':
    case 'findingsCount': {
      const av = a[key] ?? -1;
      const bv = b[key] ?? -1;
      return av - bv;
    }
    case 'lastAuditAt':
      return (a.lastAuditAt ?? '').localeCompare(b.lastAuditAt ?? '');
    case 'priority': {
      const av = a.priority ? PRIORITY_RANK[a.priority] : 0;
      const bv = b.priority ? PRIORITY_RANK[b.priority] : 0;
      return av - bv;
    }
    default:
      return 0;
  }
}

export function PagesTable({ pages, projectId }: { pages: ProjectPage[]; projectId: string }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('url');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const statuses = useMemo(() => Array.from(new Set(pages.map((page) => page.status))).sort(), [pages]);

  const visiblePages = useMemo(() => {
    const filtered = pages.filter((page) => {
      if (query.trim().length > 0 && !page.url.toLowerCase().includes(query.trim().toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && page.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== 'all' && (page.priority ?? 'none') !== priorityFilter) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => compareValues(a, b, sortKey));
    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [pages, query, statusFilter, priorityFilter, sortKey, sortDirection]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }

  if (pages.length === 0) {
    return (
      <EmptyState
        title="No Pages yet"
        description="Run an Audit for this Project to see its pages here."
        action={
          <Link href={`/projects/${projectId}`} className="btn btn-primary btn-sm">
            Run an Audit
          </Link>
        }
      />
    );
  }

  return (
    <div className="stack">
      <div className="form-row">
        <div className="field">
          <label htmlFor="pages-search">Search</label>
          <input
            id="pages-search"
            className="input"
            type="search"
            placeholder="Filter by URL…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="pages-status-filter">Status</label>
          <select
            id="pages-status-filter"
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
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
          <label htmlFor="pages-priority-filter">Priority</label>
          <select
            id="pages-priority-filter"
            className="select"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {visiblePages.length === 0 ? (
        <EmptyState title="No Pages match your search/filter" />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column.key}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleSort(column.key)}>
                      {column.label}
                      {sortKey === column.key ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  </th>
                ))}
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visiblePages.map((page) => (
                <tr key={page.latestAuditId}>
                  <td>
                    <Link href={`/audits/${page.latestAuditId}`} className="text-mono">
                      {page.url}
                    </Link>
                  </td>
                  <td>
                    <Badge>{page.status}</Badge>
                  </td>
                  <td>{scoreCell(page.overallScore)}</td>
                  <td>{scoreCell(page.seoScore)}</td>
                  <td>{scoreCell(page.aiVisibilityScore)}</td>
                  <td>{page.lastAuditAt ?? '—'}</td>
                  <td>{page.findingsCount}</td>
                  <td>{page.priority ? <Badge>{page.priority}</Badge> : <span className="text-tertiary">None</span>}</td>
                  <td>
                    <Link href={`/projects/${projectId}/compare?url=${encodeURIComponent(page.url)}`} className="btn btn-secondary btn-sm">
                      Compare
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
