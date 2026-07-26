import Link from 'next/link';
import type { ReportConclusion } from '@ai-visibility/contracts';
import { getExecutiveClientReport } from '../../../../../actions';

function ConclusionList({ title, conclusions }: { title: string; conclusions: ReportConclusion[] }) {
  return (
    <section>
      <h2>{title}</h2>
      {conclusions.length === 0 && <p>None.</p>}
      <ul>
        {conclusions.map((conclusion, index) => (
          <li key={index}>
            <p>{conclusion.statement}</p>
            <p>Confidence: {conclusion.confidence}</p>
            <details>
              <summary>Evidence</summary>
              <ul>
                {conclusion.evidence.map((fact, factIndex) => (
                  <li key={factIndex}>
                    {fact.label}: {fact.value}
                  </li>
                ))}
              </ul>
              <p>
                Related Findings:{' '}
                {conclusion.relatedFindings.map((f) => f.ruleId).join(', ') || 'None'}
              </p>
              <p>
                Related Optimization Rules:{' '}
                {conclusion.relatedOptimizationRules.map((r) => `${r.ruleId} v${r.ruleVersion}`).join(', ') || 'None'}
              </p>
              {conclusion.reasoning && (
                <p>Reasoning Confidence: {conclusion.reasoning.confidence}</p>
              )}
            </details>
          </li>
        ))}
      </ul>
    </section>
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
    <main>
      <p>
        <Link href={`/projects/${id}/dashboard`}>Back to Dashboard</Link>
      </p>

      <h1>Executive Client Report</h1>

      {!report && <p>Report not available for this cycle.</p>}

      {report && (
        <div>
          <p>
            {report.clientName} — {report.projectName}
          </p>
          <p>
            Cycle Goal: {report.cycleGoal} (Status: {report.cycleStatus})
          </p>
          <p>Generated At: {report.generatedAt}</p>

          <section>
            <h2>Executive Summary</h2>
            <p>{report.executiveSummary}</p>
          </section>

          <section>
            <h2>Initial Situation</h2>
            {!report.initialSituation && <p>No Audit recorded yet for this cycle.</p>}
            {report.initialSituation && (
              <>
                <p>Audit: {report.initialSituation.auditId}</p>
                <p>URL: {report.initialSituation.url}</p>
                <p>AI Visibility Status: {report.initialSituation.aiVisibilityStatus ?? 'N/A'}</p>
                <p>{report.initialSituation.summary}</p>
              </>
            )}
          </section>

          <ConclusionList title="Key Findings" conclusions={report.keyFindings} />
          <ConclusionList title="Actions Completed" conclusions={report.actionsCompleted} />
          <ConclusionList title="Improvements Achieved" conclusions={report.improvementsAchieved} />

          <section>
            <h2>Impact Assessment Summary</h2>
            {!report.impactAssessmentSummary && <p>No Impact Assessment available yet.</p>}
            {report.impactAssessmentSummary && (
              <>
                <p>Findings Resolved: {report.impactAssessmentSummary.findingsResolvedCount}</p>
                <p>Findings Introduced: {report.impactAssessmentSummary.findingsIntroducedCount}</p>
                <p>
                  Campaign Actions Verified: {report.impactAssessmentSummary.campaignActionsVerified.verified} /{' '}
                  {report.impactAssessmentSummary.campaignActionsVerified.total}
                </p>
              </>
            )}
          </section>

          <section>
            <h2>AI Visibility Progress</h2>
            {!report.aiVisibilityProgress && <p>Not yet available.</p>}
            {report.aiVisibilityProgress && (
              <>
                <p>
                  Status: {report.aiVisibilityProgress.baselineStatus} → {report.aiVisibilityProgress.verificationStatus}{' '}
                  ({report.aiVisibilityProgress.trend})
                </p>
                <p>
                  Entity Coverage: {report.aiVisibilityProgress.entityCoverageChange.baseline} →{' '}
                  {report.aiVisibilityProgress.entityCoverageChange.verification}
                </p>
              </>
            )}
          </section>

          <section>
            <h2>Evidence</h2>
            <ul>
              {report.evidence.map((fact, index) => (
                <li key={index}>
                  {fact.label}: {fact.value}
                </li>
              ))}
            </ul>
          </section>

          <ConclusionList title="Risks" conclusions={report.risks} />
          <ConclusionList title="Recommended Next Cycle Goals" conclusions={report.recommendedNextCycleGoals} />
        </div>
      )}
    </main>
  );
}
