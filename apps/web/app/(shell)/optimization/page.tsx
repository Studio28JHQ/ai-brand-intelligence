import Link from 'next/link';
import { getLatestCampaign, listProjects } from '../../actions';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader } from '../../components/ui';

export default async function OptimizationPage() {
  const projects = await listProjects();
  const campaigns = await Promise.all(
    projects.map(async (project) => ({ project, campaign: await getLatestCampaign(project.id) })),
  );
  const withCampaigns = campaigns.filter((entry) => entry.campaign !== null);

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Optimization' }]} />
      <PageHeader title="Optimization" description="Optimization Campaigns in progress across your Projects." />

      {withCampaigns.length === 0 && (
        <EmptyState
          title="No Optimization Campaigns yet"
          description="A Campaign is created from a Project's Dashboard once a Baseline Audit is set."
        />
      )}

      {withCampaigns.map(({ project, campaign }) => (
        <Card key={project.id}>
          <div className="card__header">
            <div>
              <h3>{project.name}</h3>
              <p className="text-secondary">{project.canonicalWebsite}</p>
            </div>
            <Badge>{campaign!.status}</Badge>
          </div>
          <dl className="dl">
            <dt>Actions</dt>
            <dd>
              {campaign!.actions.filter((action) => action.status === 'verified').length} of {campaign!.actions.length}{' '}
              verified
            </dd>
          </dl>
          <Link href={`/projects/${project.id}/campaign`} className="btn btn-secondary btn-sm">
            Open Campaign
          </Link>
        </Card>
      ))}
    </main>
  );
}
