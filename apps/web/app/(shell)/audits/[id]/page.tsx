import Link from 'next/link';
import { getAudit, getAuditAnalysis } from '../../../actions';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader } from '../../../components/ui';
import { ScoresPanel } from '../../../components/scores-panel';

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);
  const analysis = audit?.status === 'completed' ? await getAuditAnalysis(id) : null;

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Audit' }]} />

      <PageHeader
        title="Audit Detail"
        description={audit?.url}
        actions={
          audit && (
            <Link href={`/projects/${audit.projectId}/dashboard`} className="btn btn-primary">
              View Project Dashboard
            </Link>
          )
        }
      />

      {!audit && (
        <Card>
          <EmptyState title="Audit not found" />
        </Card>
      )}

      {audit && (
        <div className="stack">
          <Card>
            <dl className="dl">
              <dt>Status</dt>
              <dd>
                <Badge>{audit.status}</Badge>
              </dd>
              <dt>Started At</dt>
              <dd>{audit.startedAt ?? 'N/A'}</dd>
              <dt>Completed At</dt>
              <dd>{audit.completedAt ?? 'N/A'}</dd>
              <dt>AI Visibility Status</dt>
              <dd>{audit.aiVisibilityStatus ? <Badge>{audit.aiVisibilityStatus}</Badge> : 'N/A'}</dd>
            </dl>
          </Card>

          <Card title="Execution Timeline">
            {audit.executionHistory.length === 0 && <EmptyState title="No execution history recorded" />}
            {audit.executionHistory.length > 0 && (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.executionHistory.map((record, index) => (
                      <tr key={`${record.stepId}-${index}`}>
                        <td>{record.stepId}</td>
                        <td>
                          <Badge>{record.status}</Badge>
                        </td>
                        <td>{record.durationMs}ms</td>
                        <td>{record.errorMessage ? `${record.errorCode}: ${record.errorMessage}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {audit.status === 'completed' && (
            <>
              {analysis && <ScoresPanel scores={analysis.scores} />}

              <Card title="Findings">
                {(!analysis || analysis.findings.length === 0) && (
                  <EmptyState title="No Findings recorded" description="Nothing to fix — this Audit didn't identify any issues." />
                )}
                {analysis && analysis.findings.length > 0 && (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Rule</th>
                          <th>Category</th>
                          <th>Source Engine</th>
                          <th>Outcome</th>
                          <th>Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.findings.map((finding) => (
                          <tr key={finding.id}>
                            <td>
                              {finding.ruleId} <span className="text-tertiary">v{finding.ruleVersion}</span>
                            </td>
                            <td>{finding.category}</td>
                            <td>{finding.sourceEngine}</td>
                            <td>
                              <Badge>{finding.outcome}</Badge>
                            </td>
                            <td>
                              <Badge>{finding.severity}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card title="Optimization Plan">
                {(!analysis || analysis.optimizationPlan.length === 0) && <EmptyState title="No Optimization Items" />}
                <div className="stack">
                  {analysis?.optimizationPlan.map((item, index) => (
                    <Card key={`${item.title}-${index}`} muted>
                      <div className="card__header">
                        <h4>{item.title}</h4>
                        <Badge>{item.priority}</Badge>
                      </div>
                      <p>{item.description}</p>
                      <dl className="dl">
                        <dt>Expected Impact</dt>
                        <dd>{item.expectedImpact}</dd>
                        <dt>Estimated Effort</dt>
                        <dd>{item.estimatedEffort}</dd>
                        <dt>Optimization Rule</dt>
                        <dd>
                          {item.optimizationRuleId} (v{item.optimizationRuleVersion})
                        </dd>
                      </dl>
                    </Card>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      )}
    </main>
  );
}
