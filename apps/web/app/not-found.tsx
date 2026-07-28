import Link from 'next/link';
import { Card, EmptyState, PageHeader } from './components/ui';
import { getTranslations } from '../lib/i18n/server';

export default async function NotFound() {
  const t = await getTranslations('errors');

  return (
    <main className="page">
      <PageHeader title={t('pageNotFoundTitle')} />
      <Card>
        <EmptyState
          title={t('notFoundCardTitle')}
          description={t('notFoundDescription')}
          action={
            <Link href="/workspace" className="btn btn-primary">
              {t('backToWorkspace')}
            </Link>
          }
        />
      </Card>
    </main>
  );
}
