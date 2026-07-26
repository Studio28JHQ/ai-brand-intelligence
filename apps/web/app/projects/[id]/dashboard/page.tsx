import Link from 'next/link';
import { getDashboard } from '../../../actions';

export default async function ExecutiveDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = await getDashboard(id);

  return (
    <main>
      <p>
        <Link href="/">Back to Workspace</Link>
      </p>

      <h1>Executive Dashboard</h1>

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
            <h2>Visibility Overview</h2>
            <p>AI Visibility Score: {dashboard.visibility.currentScore ?? 'N/A'}</p>
            <p>Baseline Score: {dashboard.visibility.baselineScore ?? 'N/A'}</p>
            <p>Score Trend: {dashboard.visibility.scoreTrend}</p>
            <p>Total Findings: {dashboard.visibility.totalFindings}</p>
            <p>Critical Findings: {dashboard.visibility.criticalFindings}</p>
            <p>Opportunities: {dashboard.visibility.opportunities}</p>
          </section>

          <section>
            <h2>Priority Actions</h2>
            {dashboard.priorityActions.length === 0 && <p>No priority actions.</p>}
            <ul>
              {dashboard.priorityActions.map((action, index) => (
                <li key={`${action.title}-${index}`}>
                  <p>Title: {action.title}</p>
                  <p>Rationale: {action.rationale}</p>
                  <p>Priority: {action.priority}</p>
                  <p>Estimated Effort: {action.estimatedEffort}</p>
                  <p>Expected Improvement: {action.expectedImprovement}</p>
                </li>
              ))}
            </ul>
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
