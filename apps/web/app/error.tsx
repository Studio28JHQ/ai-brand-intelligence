'use client';

import Link from 'next/link';
import { Banner, Card, PageHeader } from './components/ui';
import { useTranslations } from '../lib/i18n/client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('errors');

  return (
    <main className="page">
      <PageHeader title={t('somethingWentWrongTitle')} />
      <Card>
        <Banner variant="error">{error.message || t('unexpectedError')}</Banner>
        <div className="cluster">
          <button type="button" className="btn btn-primary" onClick={reset}>
            {t('tryAgain')}
          </button>
          <Link href="/workspace" className="btn btn-secondary">
            {t('backToWorkspace')}
          </Link>
        </div>
      </Card>
    </main>
  );
}
