import Link from 'next/link';
import type { ReportConclusion } from '@ai-visibility/contracts';
import { getExecutiveClientReport } from '../../../../../../actions';
import { Badge, Breadcrumbs, Card, CONFIDENCE_VARIANT, EmptyState, PageHeader } from '../../../../../../components/ui';

function ConclusionList({ title, conclusions }: { title: string; conclusions: ReportConclusion[] }) {
  return (
    <Card title={title}>
      {conclusions.length === 0 && <EmptyState title="None" />}
      <div className="stack">
        {conclusions.map((conclusion, index) => (
          <Card key={index} muted>
            <div className="card__header">
              <p>{conclusion.statement}</p>
              <Badge variant={CONFIDENCE_VARIANT}>{conclusion.confidence}</Badge>
            </div>
            <details>
              <summary>Evidence</summary>
              <div className="stack-sm">
                <ul className="stack-sm">
                  {conclusion.evidence.map((fact, factIndex) => (
                    <li key={factIndex} className="text-secondary">
                      {fact.label}: {fact.value}
                    </li>
                  ))}
                </ul>
                <p className="text-secondary">
                  Related Findings: {conclusion.relatedFindings.map((f) => f.ruleId).join(', ') || 'None'}
                </p>
                <p className="text-secondary">
                  Related Optimization Rules:{' '}
                  {conclusion.relatedOptimizationRules.map((r) => `${r.ruleId} v${r.ruleVersion}`).join(', ') || 'None'}
                </p>
                {conclusion.reasoning && <p className="text-secondary">Reasoning Confidence: {conclusion.reasoning.confidence}</p>}
              </div>
            </details>
          </Card>
        ))}
      </div>
    </Card>
  );
}

export default async function ExecutiveClientReportPage({
  params,
}: {
  params: Promise<{ id: string; cycleId: string }>;
}) {
  const { id, cycleId } = await params;
  const report = await getExecutiveClientReport(cycleId);

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: '/workspace' },
          { label: 'Project Dashboard', href: `/projects/${id}/dashboard` },
          { label: 'Executive Client Report' },
        ]}
      />

      <PageHeader
        title="Executive Client Report"
        description={report ? `${report.clientName} — ${report.projectName}` : undefined}
        actions={
          <Link href={`/projects/${id}/dashboard`} className="btn btn-secondary">
            Back to Dashboard
          </Link>
        }
      />

      {!report && (
        <Card>
          <EmptyState
            title="Report not available for this Cycle"
            action={
              <Link href={`/projects/${id}/dashboard`} className="btn btn-primary btn-sm">
                Back to Dashboard
              </Link>
            }
          />
        </Card>
      )}

      {report && (
        <div className="stack">
          <Card>
            <dl className="dl">
              <dt>Cycle Goal</dt>
              <dd>{report.cycleGoal}</dd>
              <dt>Cycle Status</dt>
              <dd>
                <Badge>{report.cycleStatus}</Badge>
              </dd>
              <dt>Generated At</dt>
              <dd>{report.generatedAt}</dd>
            </dl>
          </Card>

          <Card title="Executive Summary">
            <p>{report.executiveSummary}</p>
          </Card>

          <Card title="Initial Situation">
            {!report.initialSituation && <EmptyState title="No Audit recorded yet for this Cycle" />}
            {report.initialSituation && (
              <dl className="dl">
                <dt>Audit</dt>
                <dd>{report.initialSituation.auditId}</dd>
                <dt>URL</dt>
                <dd>{report.initialSituation.url}</dd>
                <dt>AI Visibility Status</dt>
                <dd>{report.initialSituation.aiVisibilityStatus ? <Badge>{report.initialSituation.aiVisibilityStatus}</Badge> : 'N/A'}</dd>
                <dt>Summary</dt>
                <dd>{report.initialSituation.summary}</dd>
              </dl>
            )}
          </Card>

          <ConclusionList title="Key Findings" conclusions={report.keyFindings} />
          <ConclusionList title="Actions Completed" conclusions={report.actionsCompleted} />
          <ConclusionList title="Improvements Achieved" conclusions={report.improvementsAchieved} />

          <div className="grid-2">
            <Card title="Impact Assessment Summary">
              {!report.impactAssessmentSummary && <EmptyState title="No Impact Assessment available yet" />}
              {report.impactAssessmentSummary && (
                <dl className="dl">
                  <dt>Findings Resolved</dt>
                  <dd>{report.impactAssessmentSummary.findingsResolvedCount}</dd>
                  <dt>Findings Introduced</dt>
                  <dd>{report.impactAssessmentSummary.findingsIntroducedCount}</dd>
                  <dt>Campaign Actions Verified</dt>
                  <dd>
                    {report.impactAssessmentSummary.campaignActionsVerified.verified} /{' '}
                    {report.impactAssessmentSummary.campaignActionsVerified.total}
                  </dd>
                </dl>
              )}
            </Card>

            <Card title="AI Visibility Progress">
              {!report.aiVisibilityProgress && <EmptyState title="Not yet available" />}
              {report.aiVisibilityProgress && (
                <dl className="dl">
                  <dt>Status</dt>
                  <dd>
                    <Badge>{report.aiVisibilityProgress.baselineStatus}</Badge> → <Badge>{report.aiVisibilityProgress.verificationStatus}</Badge>{' '}
                    ({report.aiVisibilityProgress.trend})
                  </dd>
                  <dt>Entity Coverage</dt>
                  <dd>
                    {report.aiVisibilityProgress.entityCoverageChange.baseline} →{' '}
                    {report.aiVisibilityProgress.entityCoverageChange.verification}
                  </dd>
                </dl>
              )}
            </Card>
          </div>

          <Card title="Evidence">
            <ul className="stack-sm">
              {report.evidence.map((fact, index) => (
                <li key={index} className="text-secondary">
                  {fact.label}: {fact.value}
                </li>
              ))}
            </ul>
          </Card>

          <ConclusionList title="Risks" conclusions={report.risks} />
          <ConclusionList title="Recommended Next Cycle Goals" conclusions={report.recommendedNextCycleGoals} />

          <div className="next-step">
            <div className="next-step__body">
              <p className="next-step__eyebrow">What's Next</p>
              <p className="next-step__description">
                {report.cycleStatus === 'completed'
                  ? 'This Cycle is complete. Run a new Audit from the Workspace to start your next Optimization Cycle.'
                  : "Ready to move forward? Advance this Cycle's status from the Dashboard once you're satisfied with these results."}
              </p>
            </div>
            <Link
              href={report.cycleStatus === 'completed' ? '/workspace' : `/projects/${id}/dashboard`}
              className="btn btn-primary next-step__cta"
            >
              {report.cycleStatus === 'completed' ? 'Go to Workspace' : 'Back to Dashboard'}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
