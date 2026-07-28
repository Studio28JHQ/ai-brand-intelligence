'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuditHistoryEntry, AuditStatus } from '@ai-visibility/contracts';
import { Badge, ConfirmButton, EmptyState } from '../../components/ui';
import { deleteAudit, listAuditHistory, setProjectBaseline } from '../../actions';

const REFRESH_INTERVAL_MS = 8000;

const TRIGGERED_BY_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'project-overview': 'Project Overview',
  'audit-history': 'Audit History',
  'projects-page': 'Projects Page',
  onboarding: 'Onboarding',
};

type SortKey = 'startedAt' | 'finishedAt' | 'durationMs' | 'overallScore' | 'status';
type StatusFilter = 'all' | AuditStatus;

function shortId(id: string): string {
  return id.slice(0, 8);
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function formatScore(score: number | null): string {
  return score === null ? '—' : `${score}/100`;
}

function formatEstimatedStart(iso: string | null): string {
  if (!iso) return 'Calculating…';
  const deltaMs = new Date(iso).getTime() - Date.now();
  if (deltaMs <= 0) return 'any moment now';
  return deltaMs < 1000 ? `~${deltaMs}ms` : `~${(deltaMs / 1000).toFixed(1)}s`;
}

function triggeredByLabel(value: string | null): string {
  if (!value) return 'Unknown';
  return TRIGGERED_BY_LABELS[value] ?? value;
}

function compareValues(a: string | number | null, b: string | number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function AuditHistoryTable({ initialEntries }: { initialEntries: AuditHistoryEntry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('startedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compareError, setCompareError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await listAuditHistory();
    setEntries(next);
  }, []);

  // "Verify history updates automatically" (F10-S04C acceptance criterion) — Audits can be started
  // from other pages/tabs while this one stays open, so this list refreshes itself on an interval
  // rather than requiring a manual reload. A per-row SSE fan-out (like the single-Audit Live
  // Execution view, F10-S04B/CTO-104) would need genuinely new cross-audit event infrastructure;
  // polling this list every few seconds is proportionate for a screen with no per-row live progress
  // requirement of its own. See docs/04_PROJECT/DECISION_LOG.md#cto-105.
  useEffect(() => {
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const projectOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const entry of entries) {
      byId.set(entry.projectId, entry.projectName);
    }
    return [...byId.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [entries]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      if (projectFilter !== 'all' && entry.projectId !== projectFilter) return false;
      if (term.length === 0) return true;
      return (
        entry.id.toLowerCase().includes(term) ||
        entry.url.toLowerCase().includes(term) ||
        entry.projectName.toLowerCase().includes(term)
      );
    });
  }, [entries, search, statusFilter, projectFilter]);

  const sorted = useMemo(() => {
    const withKey = [...filtered];
    withKey.sort((a, b) => {
      const direction = sortDir === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'startedAt':
          return direction * compareValues(a.startedAt, b.startedAt);
        case 'finishedAt':
          return direction * compareValues(a.finishedAt, b.finishedAt);
        case 'durationMs':
          return direction * compareValues(a.durationMs, b.durationMs);
        case 'overallScore':
          return direction * compareValues(a.overallScore, b.overallScore);
        case 'status':
          return direction * compareValues(a.status, b.status);
        default:
          return 0;
      }
    });
    return withKey;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function toggleSelected(id: string) {
    setCompareError(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        next.add(id);
      }
      return next;
    });
  }

  function handleCompare() {
    setCompareError(null);
    const [firstId, secondId] = [...selectedIds];
    const first = entries.find((entry) => entry.id === firstId);
    const second = entries.find((entry) => entry.id === secondId);
    if (!first || !second) return;

    if (first.status !== 'completed' || second.status !== 'completed') {
      setCompareError('Compare requires two completed Audits.');
      return;
    }
    if (first.projectId !== second.projectId || first.url !== second.url) {
      setCompareError('Compare requires two Audits of the same Project and Page URL.');
      return;
    }

    const [baseline, target] = [first, second].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
    router.push(
      `/projects/${first.projectId}/compare?url=${encodeURIComponent(first.url)}&baselineAuditId=${baseline.id}&targetAuditId=${target.id}`,
    );
  }

  async function handleDelete(entry: AuditHistoryEntry) {
    setRowError(null);
    const result = await deleteAudit(entry.id, entry.isBaseline);
    if (result.success) {
      await refresh();
      return;
    }
    setRowError(result.error ?? 'Could not delete the Audit.');
  }

  async function handleSetBaseline(entry: AuditHistoryEntry) {
    setRowError(null);
    const ok = await setProjectBaseline(entry.projectId, entry.id);
    if (ok) {
      await refresh();
    } else {
      setRowError('Could not set this Audit as the Baseline.');
    }
  }

  return (
    <div className="stack">
      <div className="form-row">
        <div className="field" style={{ flex: '1 1 260px' }}>
          <label htmlFor="audit-history-search">Search</label>
          <input
            id="audit-history-search"
            className="input"
            type="text"
            placeholder="Audit ID, URL, or Project…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="audit-history-status">Status</label>
          <select
            id="audit-history-status"
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="audit-history-project">Project</label>
          <select
            id="audit-history-project"
            className="select"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="all">All Projects</option>
            {projectOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>&nbsp;</label>
          <button type="button" className="btn btn-secondary" disabled={selectedIds.size !== 2} onClick={handleCompare}>
            Compare Selected ({selectedIds.size}/2)
          </button>
        </div>
      </div>

      {compareError && <p className="text-secondary">{compareError}</p>}
      {rowError && <p className="text-secondary">{rowError}</p>}

      {sorted.length === 0 && <EmptyState title="No Audits match these filters" />}

      {sorted.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <span className="visually-hidden">Compare</span>
                </th>
                <th>Audit ID</th>
                <th>Project</th>
                <th role="button" onClick={() => toggleSort('startedAt')}>
                  Started {sortKey === 'startedAt' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th role="button" onClick={() => toggleSort('finishedAt')}>
                  Finished {sortKey === 'finishedAt' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th role="button" onClick={() => toggleSort('durationMs')}>
                  Duration {sortKey === 'durationMs' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th role="button" onClick={() => toggleSort('overallScore')}>
                  Overall Score {sortKey === 'overallScore' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th role="button" onClick={() => toggleSort('status')}>
                  Status {sortKey === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Triggered By</th>
                <th>Audit Type</th>
                <th>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(entry.id)}
                      disabled={entry.status !== 'completed' && !selectedIds.has(entry.id)}
                      onChange={() => toggleSelected(entry.id)}
                      aria-label={`Select Audit ${entry.id} for comparison`}
                    />
                  </td>
                  <td>
                    <Link href={`/audits/${entry.id}`}>{shortId(entry.id)}</Link>
                    <div className="text-tertiary text-mono">{entry.url}</div>
                  </td>
                  <td>
                    {entry.projectName}
                    {entry.isBaseline && (
                      <>
                        {' '}
                        <Badge variant="primary">Baseline</Badge>
                      </>
                    )}
                  </td>
                  <td>
                    {entry.status === 'queued' ? (
                      <span>
                        <Badge variant="warning">Already Running</Badge> — position {entry.queuePosition ?? '—'}
                      </span>
                    ) : (
                      (entry.startedAt ?? '—')
                    )}
                  </td>
                  <td>{entry.finishedAt ?? '—'}</td>
                  <td>{entry.status === 'queued' ? formatEstimatedStart(entry.estimatedStartAt) : formatDuration(entry.durationMs)}</td>
                  <td>{formatScore(entry.overallScore)}</td>
                  <td>
                    <Badge>{entry.status}</Badge>
                  </td>
                  <td>{triggeredByLabel(entry.triggeredBy)}</td>
                  <td>{entry.auditType}</td>
                  <td>
                    <div className="cluster">
                      <Link href={`/audits/${entry.id}`} className="btn btn-secondary btn-sm">
                        Open
                      </Link>
                      {entry.status === 'completed' && !entry.isBaseline && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleSetBaseline(entry)}>
                          Set as Baseline
                        </button>
                      )}
                      <ConfirmButton
                        label="Delete"
                        variant={entry.isBaseline ? 'danger' : 'secondary'}
                        disabled={entry.status === 'pending' || entry.status === 'running'}
                        confirmLabel={entry.isBaseline ? 'Delete this Project’s Baseline Audit?' : 'Delete this Audit?'}
                        confirmDescription={
                          entry.isBaseline
                            ? 'This Audit is the current Baseline for its Project. Deleting it permanently removes the Audit and clears the Project’s Baseline — a new one will need to be set manually.'
                            : 'This permanently removes the Audit and everything derived from it (Findings, Signals, Entities, Knowledge Graph). This cannot be undone.'
                        }
                        onConfirm={() => handleDelete(entry)}
                      />
                    </div>
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
