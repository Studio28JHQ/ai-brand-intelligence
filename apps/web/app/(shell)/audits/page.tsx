import { listAuditHistory } from '../../actions';
import { Breadcrumbs, PageHeader } from '../../components/ui';
import { RunAuditModal } from '../../components/run-audit-modal';
import { AuditHistoryTable } from './audit-history-table';
import { getTranslations } from '../../../lib/i18n/server';

export default async function AuditsPage() {
  const entries = await listAuditHistory();
  const t = await getTranslations('audits');
  const tNav = await getTranslations('navigation');

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: tNav('audits') }]} />
      <PageHeader
        title={t('title')}
        description={t('description')}
        actions={<RunAuditModal source="audit-history" />}
      />

      <AuditHistoryTable initialEntries={entries} />
    </main>
  );
}
