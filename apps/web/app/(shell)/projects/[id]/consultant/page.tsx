import { ConsultantChat } from './consultant-chat';
import { ProactiveRecommendations } from './proactive-recommendations';
import { Breadcrumbs, PageHeader } from '../../../../components/ui';

export default async function ConsultantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="page">
      <Breadcrumbs
        items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Project Dashboard', href: `/projects/${id}/dashboard` }, { label: 'AI Consultant' }]}
      />

      <PageHeader
        title="AI Consultant"
        description="Proactive recommendations for this Project, plus answers to your questions about its Findings, Optimization Plan, and Impact."
      />

      <ProactiveRecommendations projectId={id} />

      <ConsultantChat projectId={id} />
    </main>
  );
}
