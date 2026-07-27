import { getDashboard, getProjectPages } from '../../../../actions';
import { Breadcrumbs, Card, PageHeader } from '../../../../components/ui';
import { SiteExplorer } from './site-explorer';

export default async function SiteExplorerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [dashboard, pages] = await Promise.all([getDashboard(id), getProjectPages(id)]);
  const projectName = dashboard?.project.projectName ?? 'Project';
  const siteLabel = dashboard?.project.primaryDomain ?? dashboard?.project.canonicalWebsite ?? projectName;

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/workspace' },
          { label: projectName, href: `/projects/${id}/dashboard` },
          { label: 'Site Explorer' },
        ]}
      />

      <PageHeader
        title="Site Explorer"
        description="Every real Page audited for this Project, organized by its real URL structure — Site → Folders → Pages."
      />

      <Card>
        <SiteExplorer siteLabel={siteLabel} pages={pages} />
      </Card>
    </main>
  );
}
