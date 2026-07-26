import Link from 'next/link';
import { getDashboard } from '../../../actions';
import { CycleManager } from './cycle-manager';

export default async function ExecutiveDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = await getDashboard(id);

  return (
    <main>
      <p>
        <Link href="/">Back to Workspace</Link>
      </p>

      <h1>Executive Dashboard</h1>

      <p>
        <Link href={`/projects/${id}/consultant`}>Ask the AI Consultant</Link>
      </p>

      {!dashboard && <p>Dashboard not available.</p>}

      {dashboard && (
        <div>
          <section>
            <h2>Project Overview</h2>
            <p>Project: {dashboard.project.projectName}</p>
            <p>Client: {dashboard.project.clientName}</p>
            <p>Primary Domain: {dashboard.project.primaryDomain}</p>
            <p>Current Baseline: {dashboard.project.baselineAuditId ?? 'Not set'}</p>
            <p>Baseline Set At: {dashboard.project.baselineSetAt ?? 'N/A'}</p>
            <p>Latest Audit: {dashboard.project.latestAuditId ?? 'N/A'}</p>
          </section>

          <section>
            <h2>Current Optimization Cycle</h2>
            <CycleManager projectId={id} />
          </section>

          <section>
            <h2>Visibility Overview</h2>
            <p>AI Visibility Score: {dashboard.visibility.currentScore ?? 'N/A'}</p>
            <p>Baseline Score: {dashboard.visibility.baselineScore ?? 'N/A'}</p>
            <p>Score Trend: {dashboard.visibility.scoreTrend}</p>
            <p>Total Findings: {dashboard.visibility.totalFindings}</p>
            <p>Critical Findings: {dashboard.visibility.criticalFindings}</p>
            <p>Opportunities: {dashboard.visibility.opportunities}</p>
          </section>

          <section>
            <h2>Optimization Plan — Priority Actions</h2>
            {dashboard.priorityActions.length === 0 && <p>No priority actions.</p>}
            <ul>
              {dashboard.priorityActions.map((action, index) => (
                <li key={`${action.title}-${index}`}>
                  <p>Title: {action.title}</p>
                  <p>Description: {action.description}</p>
                  <p>Business Rationale: {action.rationale}</p>
                  <p>Priority: {action.priority}</p>
                  <p>Expected Impact: {action.expectedImpact}</p>
                  <p>Estimated Effort: {action.estimatedEffort}</p>
                  <p>Supporting Findings: {action.supportingFindingIds.join(', ')}</p>
                  <p>
                    Optimization Rule: {action.optimizationRuleId} (v{action.optimizationRuleVersion})
                  </p>
                  <details>
                    <summary>Reasoning</summary>
                    <p>
                      <strong>Why this action exists</strong>
                    </p>
                    <ul>
                      {action.reasoning.triggeringFindings.map((finding) => (
                        <li key={finding.findingId}>
                          Finding {finding.findingId}: rule &apos;{finding.ruleId}&apos; ({finding.category}, {finding.sourceEngine}) evaluated to &apos;{finding.outcome}&apos;.
                        </li>
                      ))}
                      {action.reasoning.appliedRules.map((rule) => (
                        <li key={`${rule.ruleId}-${rule.ruleVersion}`}>
                          Applied Optimization Rule &apos;{rule.ruleId}&apos; v{rule.ruleVersion} ({rule.category}, severity {rule.severity}).
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>What evidence supports it</strong>
                    </p>
                    {action.reasoning.evidence.length === 0 && <p>No evidence facts recorded.</p>}
                    <ul>
                      {action.reasoning.evidence.map((entry, index) => (
                        <li key={`${entry.field}-${index}`}>
                          {entry.field}: {entry.value}
                        </li>
                      ))}
                    </ul>
                    <p>
                      Knowledge Graph facts:{' '}
                      {action.reasoning.knowledgeGraphFacts.map((fact) => `${fact.dimension}=${fact.level}`).join(', ')}
                    </p>
                    <p>
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
                    <p>
                      Impact level: {action.reasoning.expectedOutcome.impactLevel} on {action.reasoning.expectedOutcome.targetDimension}
                    </p>
                    <p>Confidence: {action.reasoning.confidence}</p>
                    <p>Assumptions:</p>
                    <ul>
                      {action.reasoning.assumptions.map((assumption) => (
                        <li key={assumption.code}>
                          [{assumption.code}] {assumption.description}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Optimization Campaign</h2>
            {!dashboard.campaign && <p>No campaign yet.</p>}
            {dashboard.campaign && (
              <>
                <p>Campaign ID: {dashboard.campaign.campaignId}</p>
                <p>Status: {dashboard.campaign.status}</p>
                <p>Total Actions: {dashboard.campaign.totalActions}</p>
                <p>Pending: {dashboard.campaign.pendingActions}</p>
                <p>In Progress: {dashboard.campaign.inProgressActions}</p>
                <p>Completed: {dashboard.campaign.completedActions}</p>
                <p>Verified: {dashboard.campaign.verifiedActions}</p>
                <p>Progress: {dashboard.campaign.progressPercentage}%</p>
              </>
            )}
            <p>
              <Link href={`/projects/${id}/campaign`}>Manage Campaign</Link>
            </p>
          </section>

          <section>
            <h2>Campaign Impact</h2>
            {!dashboard.campaignImpact && <p>No impact assessment available yet.</p>}
            {dashboard.campaignImpact && (
              <>
                <p>Verification Date: {dashboard.campaignImpact.verificationDate}</p>
                <p>AI Visibility Trend: {dashboard.campaignImpact.aiVisibilityTrend}</p>
                <p>Findings Resolved: {dashboard.campaignImpact.findingsResolvedCount}</p>
                <p>Findings Introduced: {dashboard.campaignImpact.findingsIntroducedCount}</p>
                <p>Remaining Opportunities: {dashboard.campaignImpact.remainingOpportunitiesCount}</p>
                <h3>Improvement Summary</h3>
                {dashboard.campaignImpact.improvements.length === 0 && <p>No improvements recorded yet.</p>}
                <ul>
                  {dashboard.campaignImpact.improvements.map((entry, index) => (
                    <li key={`${entry.category}-${index}`}>
                      <p>
                        [{entry.category}] {entry.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section>
            <h2>Recent Activity</h2>
            <p>Latest Completed Audit: {dashboard.recentActivity.latestCompletedAuditId ?? 'N/A'}</p>
            <p>Latest Completed Audit Date: {dashboard.recentActivity.latestCompletedAuditDate ?? 'N/A'}</p>
            <p>Last Baseline Change: {dashboard.recentActivity.lastBaselineChangeAuditId ?? 'N/A'}</p>
            <p>Last Baseline Change At: {dashboard.recentActivity.lastBaselineChangeAt ?? 'N/A'}</p>
            <p>Last Execution Status: {dashboard.recentActivity.lastExecutionStatus ?? 'N/A'}</p>
            <p>Last Execution At: {dashboard.recentActivity.lastExecutionAt ?? 'N/A'}</p>
          </section>
        </div>
      )}
    </main>
  );
}
