'use client';

import { useEffect, useRef, useState } from 'react';
import type { AuditMetadata, AuditProgressEvent } from '@ai-visibility/contracts';
import { getAudit } from '../../actions';

function isTerminal(status: AuditMetadata['status']): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString();
}

function stepLine(event: Extract<AuditProgressEvent, { type: 'step' }>): string {
  const time = formatTime(event.startedAt);
  if (event.status === 'running') {
    return `[${time}] ${event.stepId} — running…`;
  }
  const duration = event.durationMs !== undefined ? ` (${event.durationMs}ms)` : '';
  const error = event.errorMessage ? ` — ${event.errorCode}: ${event.errorMessage}` : '';
  return `[${time}] ${event.stepId} — ${event.status}${duration}${error}`;
}

// "View Logs" (F10-S04E, see docs/04_PROJECT/DECISION_LOG.md#cto-107) is the real structured
// execution trace this platform actually persists per Audit (WorkflowExecutionRecord) — nothing is
// captured to a queryable log store beyond that, so this is the honest equivalent of "logs" rather
// than a fabricated console-output viewer. For a still-running Audit it streams the same real
// GET /audits/:id/events feed the Live Execution page uses, so lines appear as steps genuinely
// happen.
export function ViewLogsModal({ auditId, onClose }: { auditId: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [status, setStatus] = useState<AuditMetadata['status'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let source: EventSource | null = null;

    getAudit(auditId).then((audit) => {
      if (cancelled || !audit) {
        setLoading(false);
        return;
      }
      setStatus(audit.status);

      if (isTerminal(audit.status)) {
        setLines(
          audit.executionHistory.map((record) => {
            const time = formatTime(record.startedAt);
            const error = record.errorMessage ? ` — ${record.errorCode}: ${record.errorMessage}` : '';
            return `[${time}] ${record.stepId} — ${record.status} (${record.durationMs}ms)${error}`;
          }),
        );
        setLoading(false);
        return;
      }

      setLoading(false);
      source = new EventSource(`/api/audits/${auditId}/events`);
      source.onmessage = (message) => {
        const event = JSON.parse(message.data) as AuditProgressEvent;
        if (event.type === 'audit') {
          setStatus(event.status);
          setLines((current) => [...current, `[${formatTime(event.timestamp)}] Audit — ${event.status}`]);
          if (isTerminal(event.status)) {
            source?.close();
          }
          return;
        }
        setLines((current) => [...current, stepLine(event)]);
      };
    });

    return () => {
      cancelled = true;
      source?.close();
    };
  }, [auditId]);

  function close() {
    dialogRef.current?.close();
    onClose();
  }

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onClose}>
      <p className="dialog__title">Logs — Audit {auditId.slice(0, 8)}</p>
      {status && (
        <p className="text-secondary">
          Status: {status}
          {!isTerminal(status) ? ' (live — updates as they happen)' : ''}
        </p>
      )}

      {loading && <p className="text-secondary">Loading…</p>}
      {!loading && lines.length === 0 && <p className="text-secondary">No log lines yet.</p>}
      {!loading && lines.length > 0 && (
        <pre className="text-mono" style={{ maxHeight: '320px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
          {lines.join('\n')}
        </pre>
      )}

      <div className="cluster">
        <button type="button" className="btn btn-ghost" onClick={close}>
          Close
        </button>
      </div>
    </dialog>
  );
}
