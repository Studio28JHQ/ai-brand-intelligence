import { listActiveOperations } from '../../actions';
import { Breadcrumbs, PageHeader } from '../../components/ui';
import { ActivityTable } from './activity-table';

export default async function ActivityPage() {
  const entries = await listActiveOperations();

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Activity' }]} />
      <PageHeader
        title="Activity Center"
        description="Every currently running (and recently finished) operation across your Projects, updated in real time. This tracks Audits — the only asynchronous background workflow this platform executes today. Optimization, Import, Export, and AI Analysis are all synchronous request/response actions with no in-progress state to display, so they're never shown here as 'running'."
      />

      <ActivityTable initialEntries={entries} />
    </main>
  );
}
