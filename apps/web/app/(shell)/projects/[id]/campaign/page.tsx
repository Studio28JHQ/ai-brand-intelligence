import { CampaignManager } from './campaign-manager';
import { Breadcrumbs, PageHeader } from '../../../../components/ui';
import { getTranslations } from '../../../../../lib/i18n/server';

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('optimization');
  const tNav = await getTranslations('navigation');

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: tNav('dashboard'), href: '/workspace' },
          { label: t('projectDashboardBreadcrumb'), href: `/projects/${id}/dashboard` },
          { label: t('campaign') },
        ]}
      />

      <PageHeader title={t('campaign')} description={t('campaignPageDescription')} />

      <CampaignManager projectId={id} />
    </main>
  );
}
