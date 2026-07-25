import Link from 'next/link';
import { getAudit } from '../../actions';

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);

  return (
    <main>
      <p>
        <Link href="/">Back to Workspace</Link>
      </p>

      <h1>Audit Detail</h1>

      {!audit && <p>Audit not found.</p>}

      {audit && (
        <div>
          <p>Audit ID: {audit.id}</p>
          <p>Target URL: {audit.url}</p>
          <p>Status: {audit.status}</p>
          <p>Started At: {audit.startedAt ?? 'N/A'}</p>
          <p>Completed At: {audit.completedAt ?? 'N/A'}</p>
          <p>Latest AI Visibility Status: {audit.aiVisibilityStatus ?? 'N/A'}</p>

          <h2>Execution Timeline</h2>
          {audit.executionHistory.length === 0 && <p>No execution history recorded.</p>}
          <ul>
            {audit.executionHistory.map((record, index) => (
              <li key={`${record.stepId}-${index}`}>
                <p>Step: {record.stepId}</p>
                <p>Status: {record.status}</p>
                <p>Started At: {record.startedAt}</p>
                <p>Completed At: {record.completedAt}</p>
                <p>Duration: {record.durationMs}ms</p>
                {record.errorCode && <p>Error Code: {record.errorCode}</p>}
                {record.errorMessage && <p>Error Message: {record.errorMessage}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
