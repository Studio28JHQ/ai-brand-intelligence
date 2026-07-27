import Link from 'next/link';
import { listAudits, listProjects } from '../../actions';
import { Badge, Breadcrumbs, EmptyState, PageHeader } from '../../components/ui';
import { RunAuditModal } from '../../components/run-audit-modal';

function shortId(id: string): string {
  return id.slice(0, 8);
}

export default async function AuditsPage() {
  const [audits, projects] = await Promise.all([listAudits(), listProjects()]);
  const projectById = new Map(projects.map((project) => [project.id, project]));

  const sorted = [...audits].sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Audits' }]} />
      <PageHeader
        title="Audits"
        description="Every AI Visibility Audit run across your Projects."
        actions={<RunAuditModal />}
      />

      {sorted.length === 0 && <EmptyState title="No Audits yet" description="Run one from the Projects page." />}

      {sorted.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Audit</th>
                <th>Project</th>
                <th>Status</th>
                <th>AI Visibility</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((audit) => (
                <tr key={audit.id}>
                  <td>
                    <Link href={`/audits/${audit.id}`}>{shortId(audit.id)}</Link>
                    <div className="text-tertiary text-mono">{audit.url}</div>
                  </td>
                  <td>{projectById.get(audit.projectId)?.name ?? '—'}</td>
                  <td>
                    <Badge>{audit.status}</Badge>
                  </td>
                  <td>{audit.aiVisibilityStatus ? <Badge>{audit.aiVisibilityStatus}</Badge> : '—'}</td>
                  <td>{audit.completedAt ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
