import Link from 'next/link';
import { CampaignManager } from './campaign-manager';

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main>
      <p>
        <Link href={`/projects/${id}/dashboard`}>Back to Dashboard</Link>
      </p>

      <h1>Optimization Campaign</h1>

      <CampaignManager projectId={id} />
    </main>
  );
}
