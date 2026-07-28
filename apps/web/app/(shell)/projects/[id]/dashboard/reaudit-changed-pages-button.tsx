'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReauditChangedPagesResult } from '@ai-visibility/contracts';
import { Banner } from '../../../../components/ui';
import { reauditChangedPages } from '../../../../actions';
import { useTranslations } from '../../../../../lib/i18n/client';

// "Reaudit Changed Pages Only" (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106) — a real
// content-hash comparison against each Page's last CrawlResult, not a blanket re-run. New Audits
// for changed Pages are created immediately (and, per the queue, may show as 'queued' rather than
// 'running' if another Audit is already in flight for this Project — that's expected, not an error).
export function ReauditChangedPagesButton({ projectId }: { projectId: string }) {
  const t = useTranslations('dashboard');
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
        {pending ? t('checkingPages') : t('reauditChangedPagesOnly')}
      </button>

      {error && <Banner variant="error">{error}</Banner>}

      {result && (
        <Banner variant={result.changedPages.length > 0 ? 'success' : 'info'}>
          {t('checkedPagesSummary', {
            checked: result.checkedCount,
            plural: result.checkedCount === 1 ? '' : 's',
            changed: result.changedPages.length,
            queuedSuffix: result.changedPages.length > 0 ? t('queuedForNewAudit') : '',
            unchanged: result.unchangedCount,
            skippedSuffix: result.skippedCount > 0 ? t('skippedSuffix', { skipped: result.skippedCount }) : '',
          })}
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
