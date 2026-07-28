'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ActiveOperationEntry } from '@ai-visibility/contracts';
import { Badge, ConfirmButton, EmptyState, statusToVariant } from '../../components/ui';
import { cancelAudit, listActiveOperations, runNewAudit } from '../../actions';
import { useTranslations } from '../../../lib/i18n/client';
import type { Translator } from '@ai-visibility/i18n';
import { ViewLogsModal } from './view-logs-modal';

const POLL_INTERVAL_MS = 4000;
const TICK_INTERVAL_MS = 1000;

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function formatEstimatedStart(iso: string | null, t: Translator): string {
  if (!iso) return t('calculating');
  const deltaMs = new Date(iso).getTime() - Date.now();
  if (deltaMs <= 0) return t('anyMomentNow');
  return t('fromNow', { duration: formatDuration(deltaMs) });
}

export function ActivityTable({ initialEntries }: { initialEntries: ActiveOperationEntry[] }) {
  const t = useTranslations('activity');
  const tCommon = useTranslations('common');
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
      setRowError(result.error ?? t('couldNotCancel'));
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
    setRowError(result.error ?? t('couldNotRetry'));
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
    return <EmptyState title={t('nothingRunningTitle')} description={t('nothingRunningDescription')} />;
  }

  return (
    <div className="stack">
      {rowError && <p className="text-secondary">{rowError}</p>}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>{t('project')}</th>
              <th>{t('operation')}</th>
              <th>{t('currentStep')}</th>
              <th>{t('progressColumn')}</th>
              <th>{t('started')}</th>
              <th>{t('duration')}</th>
              <th>{tCommon('status')}</th>
              <th>
                <span className="visually-hidden">{tCommon('actions')}</span>
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
                <td>{t('audit')}</td>
                <td>
                  {entry.currentStepLabel ?? '—'}
                  {entry.status === 'queued' && (
                    <div className="text-tertiary">
                      {t('position')} {entry.queuePosition ?? '—'} · {formatEstimatedStart(entry.estimatedStartAt, t)}
                    </div>
                  )}
                </td>
                <td>{entry.progressPercent !== null ? `${entry.progressPercent}%` : '—'}</td>
                <td>{entry.startedAt ?? (entry.status === 'queued' ? t('notYetStarted') : '—')}</td>
                <td>{durationLabel(entry)}</td>
                <td>
                  <Badge variant={statusToVariant(entry.status)}>{tCommon(`statusValues.${entry.status}`)}</Badge>
                </td>
                <td>
                  <div className="cluster">
                    <Link href={`/audits/${entry.id}`} className="btn btn-secondary btn-sm">
                      {tCommon('open')}
                    </Link>
                    {entry.canCancel && (
                      <ConfirmButton
                        label={tCommon('cancel')}
                        variant="danger"
                        disabled={pendingId === entry.id}
                        confirmLabel={t('cancelQueuedAuditConfirm')}
                        confirmDescription={t('cancelQueuedAuditDescription')}
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
                        {pendingId === entry.id ? t('retrying') : tCommon('retry')}
                      </button>
                    )}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewLogsId(entry.id)}>
                      {t('viewLogs')}
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
