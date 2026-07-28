import { listActiveOperations } from '../../actions';
import { Breadcrumbs, PageHeader } from '../../components/ui';
import { ActivityTable } from './activity-table';
import { getTranslations } from '../../../lib/i18n/server';

export default async function ActivityPage() {
  const entries = await listActiveOperations();
  const t = await getTranslations('activity');
  const tNav = await getTranslations('navigation');

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: tNav('activity') }]} />
      <PageHeader title={t('title')} description={t('description')} />

      <ActivityTable initialEntries={entries} />
    </main>
  );
}
