import Link from 'next/link';
import { getAudit, getAuditAnalysis } from '../../../actions';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader } from '../../../components/ui';
import { ScoresPanel } from '../../../components/scores-panel';
import { RecommendationExplainability } from '../../../components/recommendation-explainability';
import { findRuleExplanationForItem } from '../../../lib/recommendation-explainability';
import { DetailSectionCard } from './detail-section-card';
import { ExecutionTimeline } from './execution-timeline';
import { buildDetailSections, externalLinksSignal, findRuleByRuleId, findSignalByKey } from './page-detail';

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);
  const analysis = audit?.status === 'completed' ? await getAuditAnalysis(id) : null;

  const indexabilityRule = analysis ? findRuleByRuleId(analysis, 'seo-indexability') : undefined;
  const indexabilitySignal = findSignalByKey(indexabilityRule, 'indexability');
  const canonicalSignal = findSignalByKey(indexabilityRule, 'canonical');
  const detailSections = analysis ? buildDetailSections(analysis) : [];
  const externalLinks = analysis ? externalLinksSignal(analysis) : undefined;

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: 'Audit' }]} />

      <PageHeader
        title="Page Detail"
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
          <Card title="Overview">
            <dl className="dl">
              <dt>URL</dt>
              <dd className="text-mono">{audit.url}</dd>
              <dt>HTTP Status</dt>
              <dd>{typeof indexabilitySignal?.data.httpStatus === 'number' ? indexabilitySignal.data.httpStatus : 'N/A'}</dd>
              <dt>Canonical</dt>
              <dd className="text-mono">
                {typeof canonicalSignal?.data.canonicalUrl === 'string' ? canonicalSignal.data.canonicalUrl : 'Not set'}
              </dd>
              <dt>Indexability</dt>
              <dd>
                {indexabilityRule ? (
                  <Badge variant={indexabilityRule.finding.evidence.isIndexable ? 'success' : 'danger'}>
                    {indexabilityRule.finding.evidence.isIndexable ? 'Indexable' : 'Blocked'}
                  </Badge>
                ) : (
                  'N/A'
                )}
              </dd>
              <dt>Crawl Date</dt>
              <dd>{audit.completedAt ?? 'N/A'}</dd>
            </dl>
          </Card>

          <ExecutionTimeline audit={audit} />

          {audit.status === 'completed' && (
            <>
              {analysis && <ScoresPanel scores={analysis.scores} />}

              {detailSections.map((section) => (
                <DetailSectionCard key={section.key} section={section} />
              ))}

              <Card
                title="External Links"
                description="No Analysis Rule evaluates External Links today — this count is a real Signal, shown without a fabricated pass/fail check."
              >
                {externalLinks ? (
                  <dl className="dl">
                    <dt>External Links</dt>
                    <dd>{typeof externalLinks.data.externalLinkCount === 'number' ? externalLinks.data.externalLinkCount : 'N/A'}</dd>
                  </dl>
                ) : (
                  <EmptyState title="No data" description="No Signal available for this Audit." />
                )}
              </Card>

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

              <Card title="Recommendations">
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
                      <RecommendationExplainability
                        item={item}
                        rule={analysis ? findRuleExplanationForItem(analysis.scores, item) : undefined}
                      />
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
