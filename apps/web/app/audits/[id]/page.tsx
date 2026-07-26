import Link from 'next/link';
import { getAudit, getAuditAnalysis } from '../../actions';

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);
  const analysis = audit?.status === 'completed' ? await getAuditAnalysis(id) : null;

  return (
    <main>
      <p>
        <Link href="/">Back to Workspace</Link>
      </p>

      <h1>Audit Detail</h1>

      {!audit && <p>Audit not found.</p>}

      {audit && (
        <div>
          <p>
            <Link href={`/projects/${audit.projectId}/dashboard`}>View Project Dashboard</Link>
          </p>
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

          {audit.status === 'completed' && (
            <>
              <h2>Findings</h2>
              {(!analysis || analysis.findings.length === 0) && <p>No findings recorded.</p>}
              {analysis && analysis.findings.length > 0 && (
                <ul>
                  {analysis.findings.map((finding) => (
                    <li key={finding.id}>
                      <p>Rule: {finding.ruleId} (v{finding.ruleVersion})</p>
                      <p>Category: {finding.category}</p>
                      <p>Source Engine: {finding.sourceEngine}</p>
                      <p>Outcome: {finding.outcome}</p>
                      <p>Severity: {finding.severity}</p>
                    </li>
                  ))}
                </ul>
              )}

              <h2>Optimization Plan</h2>
              {(!analysis || analysis.optimizationPlan.length === 0) && <p>No optimization items.</p>}
              {analysis && analysis.optimizationPlan.length > 0 && (
                <ul>
                  {analysis.optimizationPlan.map((item, index) => (
                    <li key={`${item.title}-${index}`}>
                      <p>Title: {item.title}</p>
                      <p>Description: {item.description}</p>
                      <p>Priority: {item.priority}</p>
                      <p>Expected Impact: {item.expectedImpact}</p>
                      <p>Estimated Effort: {item.estimatedEffort}</p>
                      <p>
                        Optimization Rule: {item.optimizationRuleId} (v{item.optimizationRuleVersion})
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
