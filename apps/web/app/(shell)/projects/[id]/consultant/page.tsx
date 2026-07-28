import { ConsultantChat } from './consultant-chat';
import { ProactiveRecommendations } from './proactive-recommendations';
import { Breadcrumbs, PageHeader } from '../../../../components/ui';
import { getTranslations } from '../../../../../lib/i18n/server';

export default async function ConsultantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('optimization');
  const tNav = await getTranslations('navigation');

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: tNav('dashboard'), href: '/workspace' },
          { label: t('projectDashboardBreadcrumb'), href: `/projects/${id}/dashboard` },
          { label: t('aiConsultantTitle') },
        ]}
      />

      <PageHeader title={t('aiConsultantTitle')} description={t('aiConsultantDescription')} />

      <ProactiveRecommendations projectId={id} />

      <ConsultantChat projectId={id} />
    </main>
  );
}
