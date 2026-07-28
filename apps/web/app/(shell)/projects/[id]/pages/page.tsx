import Link from 'next/link';
import { getDashboard, getProjectPages } from '../../../../actions';
import { Breadcrumbs, Card, PageHeader } from '../../../../components/ui';
import { PagesTable } from './pages-table';
import { getTranslations } from '../../../../../lib/i18n/server';

export default async function ProjectPagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
          { label: t('title') },
        ]}
      />

      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={
          <Link href={`/projects/${id}/site-explorer`} className="btn btn-secondary">
            {t('openSiteExplorer')}
          </Link>
        }
      />

      <Card>
        <PagesTable pages={pages} projectId={id} />
      </Card>
    </main>
  );
}
