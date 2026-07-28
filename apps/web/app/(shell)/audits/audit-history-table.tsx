'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuditHistoryEntry, AuditStatus } from '@ai-visibility/contracts';
import { Badge, ConfirmButton, EmptyState, statusToVariant } from '../../components/ui';
import { deleteAudit, listAuditHistory, setProjectBaseline } from '../../actions';
import { useTranslations } from '../../../lib/i18n/client';
import type { Translator } from '@ai-visibility/i18n';

const REFRESH_INTERVAL_MS = 8000;

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

function formatEstimatedStart(iso: string | null, t: Translator): string {
  if (!iso) return t('calculating');
  const deltaMs = new Date(iso).getTime() - Date.now();
  if (deltaMs <= 0) return t('anyMomentNow');
  return deltaMs < 1000 ? `~${deltaMs}ms` : `~${(deltaMs / 1000).toFixed(1)}s`;
}

function triggeredByLabel(value: string | null, t: Translator): string {
  if (!value) return t('triggeredByUnknown');
  const key: Record<string, string> = {
    dashboard: 'triggeredByDashboard',
    'project-overview': 'triggeredByProjectOverview',
    'audit-history': 'triggeredByAuditHistory',
    'projects-page': 'triggeredByProjectsPage',
    onboarding: 'triggeredByOnboarding',
  };
  return key[value] ? t(key[value]) : value;
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
  const t = useTranslations('audits');
  const tCommon = useTranslations('common');
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
      setCompareError(t('compareRequiresTwoCompleted'));
      return;
    }
    if (first.projectId !== second.projectId || first.url !== second.url) {
      setCompareError(t('compareRequiresSameProjectUrl'));
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
    setRowError(result.error ?? t('couldNotDeleteAudit'));
  }

  async function handleSetBaseline(entry: AuditHistoryEntry) {
    setRowError(null);
    const ok = await setProjectBaseline(entry.projectId, entry.id);
    if (ok) {
      await refresh();
    } else {
      setRowError(t('couldNotSetBaseline'));
    }
  }

  return (
    <div className="stack">
      <div className="form-row">
        <div className="field" style={{ flex: '1 1 260px' }}>
          <label htmlFor="audit-history-search">{t('searchLabel')}</label>
          <input
            id="audit-history-search"
            className="input"
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="audit-history-status">{tCommon('status')}</label>
          <select
            id="audit-history-status"
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="pending">{tCommon('statusValues.pending')}</option>
            <option value="running">{tCommon('statusValues.running')}</option>
            <option value="completed">{tCommon('statusValues.completed')}</option>
            <option value="failed">{tCommon('statusValues.failed')}</option>
            <option value="cancelled">{tCommon('statusValues.cancelled')}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="audit-history-project">{t('projectLabel')}</label>
          <select
            id="audit-history-project"
            className="select"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="all">{t('allProjects')}</option>
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
            {t('compareSelectedCount', { selected: selectedIds.size })}
          </button>
        </div>
      </div>

      {compareError && <p className="text-secondary">{compareError}</p>}
      {rowError && <p className="text-secondary">{rowError}</p>}

      {sorted.length === 0 && <EmptyState title={t('noAuditsMatchFilters')} />}

      {sorted.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <span className="visually-hidden">{t('compareColumnHidden')}</span>
                </th>
                <th>{t('auditId')}</th>
                <th>{t('projectLabel')}</th>
                <th role="button" onClick={() => toggleSort('startedAt')}>
                  {t('started')} {sortKey === 'startedAt' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th role="button" onClick={() => toggleSort('finishedAt')}>
                  {t('finished')} {sortKey === 'finishedAt' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th role="button" onClick={() => toggleSort('durationMs')}>
                  {t('duration')} {sortKey === 'durationMs' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th role="button" onClick={() => toggleSort('overallScore')}>
                  {t('overallScore')} {sortKey === 'overallScore' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th role="button" onClick={() => toggleSort('status')}>
                  {tCommon('status')} {sortKey === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>{t('triggeredBy')}</th>
                <th>{t('auditType')}</th>
                <th>
                  <span className="visually-hidden">{t('actionsColumnHidden')}</span>
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
                      aria-label={t('selectAuditForComparison', { id: entry.id })}
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
                        <Badge variant="primary">{t('baseline')}</Badge>
                      </>
                    )}
                  </td>
                  <td>
                    {entry.status === 'queued' ? (
                      <span>
                        <Badge variant="warning">{t('alreadyRunning')}</Badge> — {t('position')} {entry.queuePosition ?? '—'}
                      </span>
                    ) : (
                      (entry.startedAt ?? '—')
                    )}
                  </td>
                  <td>{entry.finishedAt ?? '—'}</td>
                  <td>
                    {entry.status === 'queued'
                      ? formatEstimatedStart(entry.estimatedStartAt, t)
                      : formatDuration(entry.durationMs)}
                  </td>
                  <td>{formatScore(entry.overallScore)}</td>
                  <td>
                    <Badge variant={statusToVariant(entry.status)}>{tCommon(`statusValues.${entry.status}`)}</Badge>
                  </td>
                  <td>{triggeredByLabel(entry.triggeredBy, t)}</td>
                  <td>{entry.auditType}</td>
                  <td>
                    <div className="cluster">
                      <Link href={`/audits/${entry.id}`} className="btn btn-secondary btn-sm">
                        {t('open')}
                      </Link>
                      {entry.status === 'completed' && !entry.isBaseline && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleSetBaseline(entry)}>
                          {t('setAsBaseline')}
                        </button>
                      )}
                      <ConfirmButton
                        label={t('delete')}
                        variant={entry.isBaseline ? 'danger' : 'secondary'}
                        disabled={entry.status === 'pending' || entry.status === 'running'}
                        confirmLabel={entry.isBaseline ? t('deleteBaselineConfirm') : t('deleteAuditConfirm')}
                        confirmDescription={entry.isBaseline ? t('deleteBaselineDescription') : t('deleteAuditDescription')}
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
