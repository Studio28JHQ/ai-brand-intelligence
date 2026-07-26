import { ConsultantChat } from './consultant-chat';
import { Breadcrumbs, PageHeader } from '../../../components/ui';

export default async function ConsultantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="page">
      <Breadcrumbs
        items={[{ label: 'Workspace', href: '/' }, { label: 'Dashboard', href: `/projects/${id}/dashboard` }, { label: 'AI Consultant' }]}
      />

      <PageHeader title="AI Consultant" description="Ask about this Project's Findings, Optimization Plan, and Impact." />

      <ConsultantChat projectId={id} />
    </main>
  );
}
