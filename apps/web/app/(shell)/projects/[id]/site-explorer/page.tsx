import { getDashboard, getProjectPages } from '../../../../actions';
import { Breadcrumbs, Card, PageHeader } from '../../../../components/ui';
import { SiteExplorer } from './site-explorer';
import { getTranslations } from '../../../../../lib/i18n/server';

export default async function SiteExplorerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [dashboard, pages] = await Promise.all([getDashboard(id), getProjectPages(id)]);
  const t = await getTranslations('pages');
  const tNav = await getTranslations('navigation');
  const projectName = dashboard?.project.projectName ?? tNav('projects');
  const siteLabel = dashboard?.project.primaryDomain ?? dashboard?.project.canonicalWebsite ?? projectName;

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: tNav('dashboard'), href: '/workspace' },
          { label: projectName, href: `/projects/${id}/dashboard` },
          { label: t('siteExplorer') },
        ]}
      />

      <PageHeader title={t('siteExplorer')} description={t('siteExplorerDescription')} />

      <Card>
        <SiteExplorer siteLabel={siteLabel} pages={pages} />
      </Card>
    </main>
  );
}
