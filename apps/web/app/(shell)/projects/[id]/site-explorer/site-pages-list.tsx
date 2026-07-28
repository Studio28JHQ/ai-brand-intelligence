'use client';

import Link from 'next/link';
import type { ProjectPage } from '@ai-visibility/contracts';
import { Badge, EmptyState, statusToVariant } from '../../../../components/ui';
import { useTranslations } from '../../../../../lib/i18n/client';

export function SitePagesList({
  pages,
  selected,
  onToggleSelect,
}: {
  pages: ProjectPage[];
  selected: ReadonlySet<string>;
  onToggleSelect: (auditId: string) => void;
}) {
  const t = useTranslations('pages');
  const tCommon = useTranslations('common');
  const tFindings = useTranslations('findings');

  function scoreLabel(score: number | null): string {
    return score === null ? tFindings('insufficientData') : `${score}/100`;
  }

  if (pages.length === 0) {
    return <EmptyState title={t('noPagesMatchFilter')} />;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th aria-label={t('selectColumnAriaLabel')} />
            <th>{t('url')}</th>
            <th>{tCommon('status')}</th>
            <th>{t('overallScore')}</th>
            <th>{t('seoScore')}</th>
            <th>{t('aiVisibilityScore')}</th>
            <th>{t('priority')}</th>
            <th>{t('findings')}</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.latestAuditId}>
              <td>
                <input
                  type="checkbox"
                  checked={selected.has(page.latestAuditId)}
                  onChange={() => onToggleSelect(page.latestAuditId)}
                  aria-label={t('selectAriaLabel', { url: page.url })}
                />
              </td>
              <td>
                <Link href={`/audits/${page.latestAuditId}`} className="text-mono">
                  {page.url}
                </Link>
              </td>
              <td>
                <Badge variant={statusToVariant(page.status)}>{tCommon(`statusValues.${page.status}`)}</Badge>
              </td>
              <td>{scoreLabel(page.overallScore)}</td>
              <td>{scoreLabel(page.seoScore)}</td>
              <td>{scoreLabel(page.aiVisibilityScore)}</td>
              <td>
                {page.priority ? (
                  <Badge variant={statusToVariant(page.priority)}>{tCommon(`statusValues.${page.priority}`)}</Badge>
                ) : (
                  <span className="text-tertiary">{t('none')}</span>
                )}
              </td>
              <td>{page.findingsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
