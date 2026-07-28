import { getDashboard, getProjectPages } from '../../../../actions';
import { Breadcrumbs, Card, PageHeader } from '../../../../components/ui';
import { CompareAudits } from './compare-audits';
import { getTranslations } from '../../../../../lib/i18n/server';

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string; baselineAuditId?: string; targetAuditId?: string }>;
}) {
  const { id } = await params;
  const { url, baselineAuditId, targetAuditId } = await searchParams;
  const [dashboard, pages] = await Promise.all([getDashboard(id), getProjectPages(id)]);
  const t = await getTranslations('pages');
  const tNav = await getTranslations('navigation');
  const projectName = dashboard?.project.projectName ?? tNav('projects');

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: tNav('dashboard'), href: '/workspace' },
          { label: projectName, href: `/projects/${id}/dashboard` },
          { label: t('compareAuditsTitle') },
        ]}
      />

      <PageHeader title={t('compareAuditsTitle')} description={t('compareAuditsDescription')} />

      {pages.length === 0 ? (
        <Card>
          <p className="text-secondary">{t('noPagesRunAuditFirst')}</p>
        </Card>
      ) : (
        <CompareAudits
          projectId={id}
          pages={pages}
          initialUrl={url}
          initialBaselineAuditId={baselineAuditId}
          initialTargetAuditId={targetAuditId}
        />
      )}
    </main>
  );
}
