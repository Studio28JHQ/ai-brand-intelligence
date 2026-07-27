import { getDashboard, getProjectPages } from '../../../../actions';
import { Breadcrumbs, Card, PageHeader } from '../../../../components/ui';
import { PagesTable } from './pages-table';

export default async function ProjectPagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [dashboard, pages] = await Promise.all([getDashboard(id), getProjectPages(id)]);
  const projectName = dashboard?.project.projectName ?? 'Project';

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/workspace' },
          { label: projectName, href: `/projects/${id}/dashboard` },
          { label: 'Pages' },
        ]}
      />

      <PageHeader
        title="Pages"
        description="Every distinct URL audited for this Project — one row per crawled page, each linking to its most recent real Audit."
      />

      <Card>
        <PagesTable pages={pages} projectId={id} />
      </Card>
    </main>
  );
}
