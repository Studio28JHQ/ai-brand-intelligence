import Link from 'next/link';
import { getCurrentCycle, listProjects } from '../../actions';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader } from '../../components/ui';

const REPORT_READY_STATUSES = new Set(['verification', 'completed']);

export default async function ReportsPage() {
  const projects = await listProjects();
  const cycles = await Promise.all(projects.map(async (project) => ({ project, cycle: await getCurrentCycle(project.id) })));
  const withReports = cycles.filter((entry) => entry.cycle !== null && REPORT_READY_STATUSES.has(entry.cycle.status));

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Reports' }]} />
      <PageHeader title="Reports" description="Executive Client Reports available once a Cycle reaches verification." />

      {withReports.length === 0 && (
        <EmptyState
          title="No Reports available yet"
          description="A Report becomes available once a Project's Optimization Cycle reaches verification."
        />
      )}

      {withReports.map(({ project, cycle }) => (
        <Card key={project.id}>
          <div className="card__header">
            <div>
              <h3>{project.name}</h3>
              <p className="text-secondary">{project.canonicalWebsite}</p>
            </div>
            <Badge>{cycle!.status}</Badge>
          </div>
          <Link href={`/projects/${project.id}/cycles/${cycle!.id}/report`} className="btn btn-secondary btn-sm">
            View Report
          </Link>
        </Card>
      ))}
    </main>
  );
}
