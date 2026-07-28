'use client';

import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Banner } from './ui';
import { runNewAudit } from '../actions';

// The primary "Run New Audit" action, reused everywhere the ticket asks for it (Project
// Dashboard, Project Overview, Audit History). Opens a native <dialog> (the same pattern
// ConfirmButton already established, F9-S01/CTO-077) rather than a bespoke modal implementation.
// Confirming calls the real POST /audits — this platform has no async job queue, so by the time
// the request resolves the real Workflow has already started and finished; navigating to
// /audits/:id (the existing Page Detail / Audit Execution view) then shows its real, completed
// Execution Timeline, not a fabricated "in progress" state.
export function RunAuditModal({
  defaultUrl,
  triggerLabel = 'Run New Audit',
  source,
}: {
  defaultUrl?: string;
  triggerLabel?: string;
  source: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const urlInputId = useId();
  const router = useRouter();
  const [url, setUrl] = useState(defaultUrl ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open() {
    setUrl(defaultUrl ?? '');
    setError(null);
    dialogRef.current?.showModal();
  }

  function close() {
    if (submitting) return;
    dialogRef.current?.close();
  }

  async function handleConfirm() {
    if (url.trim().length === 0) {
      setError('Target URL is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await runNewAudit(url.trim(), source);
    setSubmitting(false);

    if (result.auditId) {
      dialogRef.current?.close();
      router.push(`/audits/${result.auditId}`);
      return;
    }
    setError(result.error ?? 'Could not start the Audit.');
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={open}>
        {triggerLabel}
      </button>
      <dialog ref={dialogRef} className="dialog">
        <p className="dialog__title">Run New Audit</p>

        <div className="stack">
          <div className="field">
            <label htmlFor={urlInputId}>Target URL</label>
            <input
              id={urlInputId}
              className="input"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="field">
            <label>Audit Type</label>
            <label className="site-explorer__issue-toggle">
              <input type="radio" name={`${urlInputId}-audit-type`} checked readOnly />
              Full Audit — the complete deterministic pipeline (SEO, Technical, Content, Accessibility, Performance, AI Visibility).
            </label>
            <label className="site-explorer__issue-toggle" title="Not yet available — will run a smaller, faster subset of checks.">
              <input type="radio" name={`${urlInputId}-audit-type`} disabled />
              <span className="text-tertiary">Quick Audit (coming soon)</span>
            </label>
          </div>

          {error && <Banner variant="error">{error}</Banner>}

          <div className="cluster">
            <button type="button" className="btn btn-primary" disabled={submitting} onClick={handleConfirm}>
              {submitting ? 'Starting Audit…' : 'Confirm & Run Audit'}
            </button>
            <button type="button" className="btn btn-ghost" disabled={submitting} onClick={close}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
