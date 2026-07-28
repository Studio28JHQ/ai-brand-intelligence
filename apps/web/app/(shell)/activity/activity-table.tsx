'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ActiveOperationEntry } from '@ai-visibility/contracts';
import { Badge, ConfirmButton, EmptyState } from '../../components/ui';
import { cancelAudit, listActiveOperations, runNewAudit } from '../../actions';
import { ViewLogsModal } from './view-logs-modal';

const POLL_INTERVAL_MS = 4000;
const TICK_INTERVAL_MS = 1000;

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function formatEstimatedStart(iso: string | null): string {
  if (!iso) return 'Calculating…';
  const deltaMs = new Date(iso).getTime() - Date.now();
  if (deltaMs <= 0) return 'any moment now';
  return `~${formatDuration(deltaMs)} from now`;
}

export function ActivityTable({ initialEntries }: { initialEntries: ActiveOperationEntry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [now, setNow] = useState(() => Date.now());
  const [rowError, setRowError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [viewLogsId, setViewLogsId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await listActiveOperations();
    setEntries(next);
  }, []);

  // "The Dashboard must always reflect the real execution state" (F10-S04E, see
  // docs/04_PROJECT/DECISION_LOG.md#cto-107) — polls the real current state of every tracked
  // operation rather than assuming anything. A per-operation SSE fan-out was considered but this
  // list already spans every Project; polling matches the same reasoning already applied to Audit
  // History (CTO-105), just at a shorter interval given this screen is specifically about watching
  // things live.
  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleCancel(entry: ActiveOperationEntry) {
    setRowError(null);
    setPendingId(entry.id);
    const result = await cancelAudit(entry.id);
    setPendingId(null);
    if (result.success) {
      await refresh();
    } else {
      setRowError(result.error ?? 'Could not cancel this operation.');
    }
  }

  async function handleRetry(entry: ActiveOperationEntry) {
    setRowError(null);
    setPendingId(entry.id);
    const result = await runNewAudit(entry.subject, 'retry');
    setPendingId(null);
    if (result.auditId) {
      router.push(`/audits/${result.auditId}`);
      return;
    }
    setRowError(result.error ?? 'Could not retry this operation.');
  }

  function durationLabel(entry: ActiveOperationEntry): string {
    if (entry.status === 'queued') {
      return formatDuration(Math.max(0, now - new Date(entry.createdAt).getTime()));
    }
    if (entry.startedAt && entry.finishedAt) {
      return formatDuration(new Date(entry.finishedAt).getTime() - new Date(entry.startedAt).getTime());
    }
    if (entry.startedAt) {
      return formatDuration(Math.max(0, now - new Date(entry.startedAt).getTime()));
    }
    return '—';
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Nothing running right now"
        description="Operations appear here the moment they start, and stay visible briefly after finishing."
      />
    );
  }

  return (
    <div className="stack">
      {rowError && <p className="text-secondary">{rowError}</p>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Operation</th>
              <th>Current Step</th>
              <th>Progress</th>
              <th>Started</th>
              <th>Duration</th>
              <th>Status</th>
              <th>
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <Link href={`/projects/${entry.projectId}/dashboard`}>{entry.projectName}</Link>
                  <div className="text-tertiary text-mono">{entry.subject}</div>
                </td>
                <td>Audit</td>
                <td>
                  {entry.currentStepLabel ?? '—'}
                  {entry.status === 'queued' && (
                    <div className="text-tertiary">
                      Position {entry.queuePosition ?? '—'} · {formatEstimatedStart(entry.estimatedStartAt)}
                    </div>
                  )}
                </td>
                <td>{entry.progressPercent !== null ? `${entry.progressPercent}%` : '—'}</td>
                <td>{entry.startedAt ?? (entry.status === 'queued' ? 'Not yet' : '—')}</td>
                <td>{durationLabel(entry)}</td>
                <td>
                  <Badge>{entry.status}</Badge>
                </td>
                <td>
                  <div className="cluster">
                    <Link href={`/audits/${entry.id}`} className="btn btn-secondary btn-sm">
                      Open
                    </Link>
                    {entry.canCancel && (
                      <ConfirmButton
                        label="Cancel"
                        variant="danger"
                        disabled={pendingId === entry.id}
                        confirmLabel="Cancel this queued Audit?"
                        confirmDescription="It hasn't started running yet, so this simply removes it from the queue."
                        onConfirm={() => handleCancel(entry)}
                      />
                    )}
                    {entry.canRetry && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={pendingId === entry.id}
                        onClick={() => handleRetry(entry)}
                      >
                        {pendingId === entry.id ? 'Retrying…' : 'Retry'}
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewLogsId(entry.id)}>
                      View Logs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewLogsId && <ViewLogsModal auditId={viewLogsId} onClose={() => setViewLogsId(null)} />}
    </div>
  );
}
