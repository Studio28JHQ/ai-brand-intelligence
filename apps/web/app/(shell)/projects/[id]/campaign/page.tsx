import { CampaignManager } from './campaign-manager';
import { Breadcrumbs, PageHeader } from '../../../../components/ui';

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="page">
      <Breadcrumbs
        items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Project Dashboard', href: `/projects/${id}/dashboard` }, { label: 'Campaign' }]}
      />

      <PageHeader title="Optimization Campaign" description="Track Optimization Actions from plan to verified impact." />

      <CampaignManager projectId={id} />
    </main>
  );
}
