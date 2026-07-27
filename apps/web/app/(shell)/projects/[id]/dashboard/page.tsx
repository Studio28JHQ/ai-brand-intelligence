import Link from 'next/link';
import { getDashboard } from '../../../../actions';
import { CycleManager } from './cycle-manager';
import { Badge, Breadcrumbs, Card, EmptyState, NextStepBanner, PageHeader } from '../../../../components/ui';
import { ScoresPanel, ScoresSummaryBadge } from '../../../../components/scores-panel';
import { RecommendationExplainability } from '../../../../components/recommendation-explainability';
import { findRuleExplanationForItem } from '../../../../lib/recommendation-explainability';
import { computeNextStep } from '../../../../lib/next-step';

export default async function ExecutiveDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = await getDashboard(id);

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/workspace' }, { label: dashboard?.project.projectName ?? 'Project' }]} />

      <PageHeader
        title="Executive Dashboard"
        description={dashboard ? `${dashboard.project.clientName} · ${dashboard.project.primaryDomain}` : undefined}
        actions={
          <div className="cluster">
            <Link href={`/projects/${id}/pages`} className="btn btn-secondary">
              View Pages
            </Link>
            <Link href={`/projects/${id}/consultant`} className="btn btn-secondary">
              Ask the AI Consultant
            </Link>
          </div>
        }
      />

      {!dashboard && (
        <Card>
          <EmptyState title="Dashboard not available" description="The Project may not exist, or the API may be unreachable." />
        </Card>
      )}

      {dashboard && (
        <div className="stack">
          <NextStepBanner step={computeNextStep(dashboard, id)} />

          <Card title="Project Overview">
            <dl className="dl">
              <dt>Project</dt>
              <dd>{dashboard.project.projectName}</dd>
              <dt>Client</dt>
              <dd>{dashboard.project.clientName}</dd>
              <dt>Primary Domain</dt>
              <dd>{dashboard.project.primaryDomain}</dd>
              <dt>Baseline</dt>
              <dd>{dashboard.project.baselineAuditId ? <Badge variant="success">Set</Badge> : <Badge>Not set</Badge>}</dd>
              <dt>Baseline Set At</dt>
              <dd>{dashboard.project.baselineSetAt ?? 'N/A'}</dd>
              <dt>Latest Audit</dt>
              <dd>{dashboard.project.latestAuditId ?? 'N/A'}</dd>
            </dl>
          </Card>

          <Card
            title="Current Optimization Cycle"
            description="Groups every Audit, Optimization Plan, and Campaign for one measurable business period, from Planned through Completed."
          >
            <CycleManager projectId={id} />
          </Card>

          <div className="grid-2">
            <Card title="Visibility Overview">
              <dl className="dl">
                <dt>Overall Score</dt>
                <dd>
                  <ScoresSummaryBadge scores={dashboard.scores} />
                </dd>
                <dt>AI Visibility Score</dt>
                <dd>{dashboard.visibility.currentScore ? <Badge>{dashboard.visibility.currentScore}</Badge> : 'N/A'}</dd>
                <dt>Baseline Score</dt>
                <dd>{dashboard.visibility.baselineScore ? <Badge>{dashboard.visibility.baselineScore}</Badge> : 'N/A'}</dd>
                <dt>Score Trend</dt>
                <dd>
                  <Badge>{dashboard.visibility.scoreTrend}</Badge>
                </dd>
                <dt>Total Findings</dt>
                <dd>{dashboard.visibility.totalFindings}</dd>
                <dt>Critical Findings</dt>
                <dd>{dashboard.visibility.criticalFindings}</dd>
                <dt>Opportunities</dt>
                <dd>{dashboard.visibility.opportunities}</dd>
              </dl>
            </Card>

            <Card title="Recent Activity">
              <dl className="dl">
                <dt>Latest Completed Audit</dt>
                <dd>{dashboard.recentActivity.latestCompletedAuditId ?? 'N/A'}</dd>
                <dt>Completed At</dt>
                <dd>{dashboard.recentActivity.latestCompletedAuditDate ?? 'N/A'}</dd>
                <dt>Last Baseline Change</dt>
                <dd>{dashboard.recentActivity.lastBaselineChangeAuditId ?? 'N/A'}</dd>
                <dt>Changed At</dt>
                <dd>{dashboard.recentActivity.lastBaselineChangeAt ?? 'N/A'}</dd>
                <dt>Last Execution</dt>
                <dd>{dashboard.recentActivity.lastExecutionStatus ? <Badge>{dashboard.recentActivity.lastExecutionStatus}</Badge> : 'N/A'}</dd>
                <dt>Executed At</dt>
                <dd>{dashboard.recentActivity.lastExecutionAt ?? 'N/A'}</dd>
              </dl>
            </Card>
          </div>

          {dashboard.scores ? (
            <ScoresPanel scores={dashboard.scores} />
          ) : (
            <Card title="Scores">
              <EmptyState
                title="No scores yet"
                description="Scores are computed heuristically from a completed Audit's Findings — run an Audit for this Project to see them here."
              />
            </Card>
          )}

          <Card title="Optimization Plan — Priority Actions">
            {dashboard.priorityActions.length === 0 && (
              <EmptyState
                title="No priority actions"
                description="Nothing is currently flagged for this Project — run a new Audit if you'd like to check again."
              />
            )}
            <div className="stack">
              {dashboard.priorityActions.map((action, index) => (
                <Card key={`${action.title}-${index}`} muted>
                  <div className="card__header">
                    <h4>{action.title}</h4>
                    <Badge>{action.priority}</Badge>
                  </div>
                  <p>{action.description}</p>
                  <p className="text-secondary">{action.rationale}</p>
                  <dl className="dl">
                    <dt>Expected Impact</dt>
                    <dd>{action.expectedImpact}</dd>
                    <dt>Estimated Effort</dt>
                    <dd>{action.estimatedEffort}</dd>
                    <dt>Supporting Findings</dt>
                    <dd>{action.supportingFindingIds.join(', ') || 'None'}</dd>
                    <dt>Optimization Rule</dt>
                    <dd>
                      {action.optimizationRuleId} (v{action.optimizationRuleVersion})
                    </dd>
                  </dl>
                  <details>
                    <summary>Reasoning</summary>
                    <div className="stack-sm">
                      <p>
                        <strong>Why this action exists</strong>
                      </p>
                      <ul className="stack-sm">
                        {action.reasoning.triggeringFindings.map((finding) => (
                          <li key={finding.findingId} className="text-secondary">
                            Finding {finding.findingId}: rule &apos;{finding.ruleId}&apos; ({finding.category}, {finding.sourceEngine})
                            evaluated to &apos;{finding.outcome}&apos;.
                          </li>
                        ))}
                        {action.reasoning.appliedRules.map((rule) => (
                          <li key={`${rule.ruleId}-${rule.ruleVersion}`} className="text-secondary">
                            Applied Optimization Rule &apos;{rule.ruleId}&apos; v{rule.ruleVersion} ({rule.category}, severity{' '}
                            {rule.severity}).
                          </li>
                        ))}
                      </ul>
                      <p>
                        <strong>What evidence supports it</strong>
                      </p>
                      {action.reasoning.evidence.length === 0 && <p className="text-secondary">No evidence facts recorded.</p>}
                      <ul className="stack-sm">
                        {action.reasoning.evidence.map((entry, entryIndex) => (
                          <li key={`${entry.field}-${entryIndex}`} className="text-secondary">
                            {entry.field}: {entry.value}
                          </li>
                        ))}
                      </ul>
                      <p className="text-secondary">
                        Knowledge Graph facts:{' '}
                        {action.reasoning.knowledgeGraphFacts.map((fact) => `${fact.dimension}=${fact.level}`).join(', ') || 'None'}
                      </p>
                      <p className="text-secondary">
                        Entity relationships:{' '}
                        {action.reasoning.entityRelationships.length === 0
                          ? 'None (not applicable to this rule)'
                          : action.reasoning.entityRelationships
                              .map((rel) => `${rel.sourceEntityName} -${rel.relationshipType}-> ${rel.targetEntityName}`)
                              .join(', ')}
                      </p>
                      <p>
                        <strong>Expected benefit</strong>
                      </p>
                      <p className="text-secondary">
                        Impact level: {action.reasoning.expectedOutcome.impactLevel} on{' '}
                        {action.reasoning.expectedOutcome.targetDimension}
                      </p>
                      <p className="text-secondary">Confidence: {action.reasoning.confidence}</p>
                      <p>Assumptions:</p>
                      <ul className="stack-sm">
                        {action.reasoning.assumptions.map((assumption) => (
                          <li key={assumption.code} className="text-secondary">
                            [{assumption.code}] {assumption.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                  <RecommendationExplainability
                    item={action}
                    rule={dashboard.scores ? findRuleExplanationForItem(dashboard.scores, action) : undefined}
                  />
                </Card>
              ))}
            </div>
          </Card>

          <div className="grid-2">
            <Card
              title="Optimization Campaign"
              actions={
                <Link href={`/projects/${id}/campaign`} className="btn btn-secondary btn-sm">
                  Manage Campaign
                </Link>
              }
            >
              {!dashboard.campaign && (
                <EmptyState
                  title="No Campaign yet"
                  description="Create one from your current Optimization Plan to start tracking work."
                  action={
                    <Link href={`/projects/${id}/campaign`} className="btn btn-primary btn-sm">
                      Create Campaign
                    </Link>
                  }
                />
              )}
              {dashboard.campaign && (
                <dl className="dl">
                  <dt>Status</dt>
                  <dd>
                    <Badge>{dashboard.campaign.status}</Badge>
                  </dd>
                  <dt>Total Actions</dt>
                  <dd>{dashboard.campaign.totalActions}</dd>
                  <dt>Pending</dt>
                  <dd>{dashboard.campaign.pendingActions}</dd>
                  <dt>In Progress</dt>
                  <dd>{dashboard.campaign.inProgressActions}</dd>
                  <dt>Completed</dt>
                  <dd>{dashboard.campaign.completedActions}</dd>
                  <dt>Verified</dt>
                  <dd>{dashboard.campaign.verifiedActions}</dd>
                  <dt>Progress</dt>
                  <dd>{dashboard.campaign.progressPercentage}%</dd>
                </dl>
              )}
            </Card>

            <Card title="Campaign Impact">
              {!dashboard.campaignImpact && (
                <EmptyState
                  title="No Impact Assessment available yet"
                  description="This appears once a Verification Audit is run after your Campaign is completed."
                />
              )}
              {dashboard.campaignImpact && (
                <div className="stack-sm">
                  <dl className="dl">
                    <dt>Verification Date</dt>
                    <dd>{dashboard.campaignImpact.verificationDate}</dd>
                    <dt>AI Visibility Trend</dt>
                    <dd>
                      <Badge>{dashboard.campaignImpact.aiVisibilityTrend}</Badge>
                    </dd>
                    <dt>Findings Resolved</dt>
                    <dd>{dashboard.campaignImpact.findingsResolvedCount}</dd>
                    <dt>Findings Introduced</dt>
                    <dd>{dashboard.campaignImpact.findingsIntroducedCount}</dd>
                    <dt>Remaining Opportunities</dt>
                    <dd>{dashboard.campaignImpact.remainingOpportunitiesCount}</dd>
                  </dl>
                  <h4>Improvement Summary</h4>
                  {dashboard.campaignImpact.improvements.length === 0 && <p className="text-secondary">No improvements recorded yet.</p>}
                  <ul className="stack-sm">
                    {dashboard.campaignImpact.improvements.map((entry, index) => (
                      <li key={`${entry.category}-${index}`} className="text-secondary">
                        <Badge variant="neutral">{entry.category}</Badge> {entry.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
