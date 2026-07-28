'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReauditChangedPagesResult } from '@ai-visibility/contracts';
import { Banner } from '../../../../components/ui';
import { reauditChangedPages } from '../../../../actions';

// "Reaudit Changed Pages Only" (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106) — a real
// content-hash comparison against each Page's last CrawlResult, not a blanket re-run. New Audits
// for changed Pages are created immediately (and, per the queue, may show as 'queued' rather than
// 'running' if another Audit is already in flight for this Project — that's expected, not an error).
export function ReauditChangedPagesButton({ projectId }: { projectId: string }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ReauditChangedPagesResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    setResult(null);
    const outcome = await reauditChangedPages(projectId);
    setPending(false);
    if ('error' in outcome) {
      setError(outcome.error);
      return;
    }
    setResult(outcome);
  }

  return (
    <div className="stack-sm">
      <button type="button" className="btn btn-secondary" disabled={pending} onClick={handleClick}>
        {pending ? 'Checking Pages…' : 'Reaudit Changed Pages Only'}
      </button>

      {error && <Banner variant="error">{error}</Banner>}

      {result && (
        <Banner variant={result.changedPages.length > 0 ? 'success' : 'info'}>
          Checked {result.checkedCount} Page{result.checkedCount === 1 ? '' : 's'} — {result.changedPages.length} changed
          {result.changedPages.length > 0 ? ' and queued for a new Audit' : ''}, {result.unchangedCount} unchanged
          {result.skippedCount > 0 ? `, ${result.skippedCount} skipped (currently unreachable)` : ''}.
          {result.changedPages.length > 0 && (
            <ul className="stack-sm">
              {result.changedPages.map((page) => (
                <li key={page.auditId}>
                  <Link href={`/audits/${page.auditId}`}>{page.url}</Link>
                </li>
              ))}
            </ul>
          )}
        </Banner>
      )}
    </div>
  );
}
