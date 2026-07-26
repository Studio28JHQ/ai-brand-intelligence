import Link from 'next/link';
import { ConsultantChat } from './consultant-chat';

export default async function ConsultantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main>
      <p>
        <Link href={`/projects/${id}/dashboard`}>Back to Dashboard</Link>
      </p>

      <h1>AI Consultant</h1>

      <ConsultantChat projectId={id} />
    </main>
  );
}
