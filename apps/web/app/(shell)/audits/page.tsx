import { listAuditHistory } from '../../actions';
import { Breadcrumbs, PageHeader } from '../../components/ui';
import { RunAuditModal } from '../../components/run-audit-modal';
import { AuditHistoryTable } from './audit-history-table';

export default async function AuditsPage() {
  const entries = await listAuditHistory();

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Audits' }]} />
      <PageHeader
        title="Audit History"
        description="Every AI Visibility Audit run across your Projects — search, sort, filter, compare, or delete."
        actions={<RunAuditModal source="audit-history" />}
      />

      <AuditHistoryTable initialEntries={entries} />
    </main>
  );
}
