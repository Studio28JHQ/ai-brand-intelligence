import Link from 'next/link';
import { getCurrentCycle, listProjects } from '../../actions';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader, statusToVariant } from '../../components/ui';
import { getTranslations } from '../../../lib/i18n/server';

const REPORT_READY_STATUSES = new Set(['verification', 'completed']);

export default async function ReportsPage() {
  const projects = await listProjects();
  const cycles = await Promise.all(projects.map(async (project) => ({ project, cycle: await getCurrentCycle(project.id) })));
  const withReports = cycles.filter((entry) => entry.cycle !== null && REPORT_READY_STATUSES.has(entry.cycle.status));
  const t = await getTranslations('reports');
  const tNav = await getTranslations('navigation');
  const tCommon = await getTranslations('common');

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: tNav('reports') }]} />
      <PageHeader title={tNav('reports')} description={t('description')} />

      {withReports.length === 0 && (
        <EmptyState title={t('noReportsAvailableYet')} description={t('noReportsAvailableDescription')} />
      )}

      {withReports.map(({ project, cycle }) => (
        <Card key={project.id}>
          <div className="card__header">
            <div>
              <h3>{project.name}</h3>
              <p className="text-secondary">{project.canonicalWebsite}</p>
            </div>
            <Badge variant={statusToVariant(cycle!.status)}>{tCommon(`statusValues.${cycle!.status}`)}</Badge>
          </div>
          <Link href={`/projects/${project.id}/cycles/${cycle!.id}/report`} className="btn btn-secondary btn-sm">
            {t('viewReport')}
          </Link>
        </Card>
      ))}
    </main>
  );
}
