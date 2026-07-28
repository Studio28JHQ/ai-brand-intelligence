import { getDashboard, getProjectPages } from '../../../../actions';
import { Breadcrumbs, Card, PageHeader } from '../../../../components/ui';
import { CompareAudits } from './compare-audits';

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
  const projectName = dashboard?.project.projectName ?? 'Project';

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/workspace' },
          { label: projectName, href: `/projects/${id}/dashboard` },
          { label: 'Compare Audits' },
        ]}
      />

      <PageHeader
        title="Compare Audits"
        description="Compare two real Audits of the same Page — Old Score, New Score, Delta, New/Resolved/Persistent Issues, and current Recommendations. No AI provider involved."
      />

      {pages.length === 0 ? (
        <Card>
          <p className="text-secondary">No Pages yet — run an Audit for this Project first.</p>
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
