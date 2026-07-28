import Link from 'next/link';
import type { ReportConclusion } from '@ai-visibility/contracts';
import { getExecutiveClientReport } from '../../../../../../actions';
import { Badge, Breadcrumbs, Card, CONFIDENCE_VARIANT, EmptyState, PageHeader, statusToVariant } from '../../../../../../components/ui';
import { getTranslations } from '../../../../../../../lib/i18n/server';
import type { Translator } from '@ai-visibility/i18n';

function ConclusionList({
  title,
  conclusions,
  t,
  tCommon,
}: {
  title: string;
  conclusions: ReportConclusion[];
  t: Translator;
  tCommon: Translator;
}) {
  return (
    <Card title={title}>
      {conclusions.length === 0 && <EmptyState title={t('none')} />}
      <div className="stack">
        {conclusions.map((conclusion, index) => (
          <Card key={index} muted>
            <div className="card__header">
              <p>{conclusion.statement}</p>
              <Badge variant={CONFIDENCE_VARIANT}>{tCommon(`statusValues.${conclusion.confidence}`)}</Badge>
            </div>
            <details>
              <summary>{t('evidence')}</summary>
              <div className="stack-sm">
                <ul className="stack-sm">
                  {conclusion.evidence.map((fact, factIndex) => (
                    <li key={factIndex} className="text-secondary">
                      {fact.label}: {fact.value}
                    </li>
                  ))}
                </ul>
                <p className="text-secondary">
                  {t('relatedFindings')}: {conclusion.relatedFindings.map((f) => f.ruleId).join(', ') || t('none')}
                </p>
                <p className="text-secondary">
                  {t('relatedOptimizationRules')}:{' '}
                  {conclusion.relatedOptimizationRules.map((r) => `${r.ruleId} v${r.ruleVersion}`).join(', ') || t('none')}
                </p>
                {conclusion.reasoning && (
                  <p className="text-secondary">
                    {t('reasoningConfidence')}: {tCommon(`statusValues.${conclusion.reasoning.confidence}`)}
                  </p>
                )}
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
  const t = await getTranslations('reports');
  const tNav = await getTranslations('navigation');
  const tOptimization = await getTranslations('optimization');
  const tAudits = await getTranslations('audits');
  const tCommon = await getTranslations('common');
  const notApplicable = tAudits('notApplicable');

  return (
    <main className="page">
      <Breadcrumbs
        items={[
          { label: tNav('dashboard'), href: '/workspace' },
          { label: tOptimization('projectDashboardBreadcrumb'), href: `/projects/${id}/dashboard` },
          { label: t('executiveClientReport') },
        ]}
      />

      <PageHeader
        title={t('executiveClientReport')}
        description={report ? `${report.clientName} — ${report.projectName}` : undefined}
        actions={
          <Link href={`/projects/${id}/dashboard`} className="btn btn-secondary">
            {t('backToDashboard')}
          </Link>
        }
      />

      {!report && (
        <Card>
          <EmptyState
            title={t('reportNotAvailable')}
            action={
              <Link href={`/projects/${id}/dashboard`} className="btn btn-primary btn-sm">
                {t('backToDashboard')}
              </Link>
            }
          />
        </Card>
      )}

      {report && (
        <div className="stack">
          <Card>
            <dl className="dl">
              <dt>{t('cycleGoal')}</dt>
              <dd>{report.cycleGoal}</dd>
              <dt>{t('cycleStatus')}</dt>
              <dd>
                <Badge variant={statusToVariant(report.cycleStatus)}>{tCommon(`statusValues.${report.cycleStatus}`)}</Badge>
              </dd>
              <dt>{t('generatedAt')}</dt>
              <dd>{report.generatedAt}</dd>
            </dl>
          </Card>

          <Card title={t('executiveSummary')}>
            <p>{report.executiveSummary}</p>
          </Card>

          <Card title={t('initialSituation')}>
            {!report.initialSituation && <EmptyState title={t('noAuditRecorded')} />}
            {report.initialSituation && (
              <dl className="dl">
                <dt>{t('auditLabel')}</dt>
                <dd>{report.initialSituation.auditId}</dd>
                <dt>{t('urlLabel')}</dt>
                <dd>{report.initialSituation.url}</dd>
                <dt>{t('aiVisibilityStatus')}</dt>
                <dd>
                  {report.initialSituation.aiVisibilityStatus ? (
                    <Badge variant={statusToVariant(report.initialSituation.aiVisibilityStatus)}>
                      {tCommon(`statusValues.${report.initialSituation.aiVisibilityStatus}`)}
                    </Badge>
                  ) : (
                    notApplicable
                  )}
                </dd>
                <dt>{t('summaryLabel')}</dt>
                <dd>{report.initialSituation.summary}</dd>
              </dl>
            )}
          </Card>

          <ConclusionList title={t('keyFindings')} conclusions={report.keyFindings} t={t} tCommon={tCommon} />
          <ConclusionList title={t('actionsCompleted')} conclusions={report.actionsCompleted} t={t} tCommon={tCommon} />
          <ConclusionList title={t('improvementsAchieved')} conclusions={report.improvementsAchieved} t={t} tCommon={tCommon} />

          <div className="grid-2">
            <Card title={t('impactAssessmentSummary')}>
              {!report.impactAssessmentSummary && <EmptyState title={t('noImpactAssessmentYet')} />}
              {report.impactAssessmentSummary && (
                <dl className="dl">
                  <dt>{t('findingsResolved')}</dt>
                  <dd>{report.impactAssessmentSummary.findingsResolvedCount}</dd>
                  <dt>{t('findingsIntroduced')}</dt>
                  <dd>{report.impactAssessmentSummary.findingsIntroducedCount}</dd>
                  <dt>{t('campaignActionsVerified')}</dt>
                  <dd>
                    {report.impactAssessmentSummary.campaignActionsVerified.verified} /{' '}
                    {report.impactAssessmentSummary.campaignActionsVerified.total}
                  </dd>
                </dl>
              )}
            </Card>

            <Card title={t('aiVisibilityProgress')}>
              {!report.aiVisibilityProgress && <EmptyState title={t('notYetAvailable')} />}
              {report.aiVisibilityProgress && (
                <dl className="dl">
                  <dt>{t('statusLabel')}</dt>
                  <dd>
                    <Badge variant={statusToVariant(report.aiVisibilityProgress.baselineStatus)}>
                      {tCommon(`statusValues.${report.aiVisibilityProgress.baselineStatus}`)}
                    </Badge>{' '}
                    →{' '}
                    <Badge variant={statusToVariant(report.aiVisibilityProgress.verificationStatus)}>
                      {tCommon(`statusValues.${report.aiVisibilityProgress.verificationStatus}`)}
                    </Badge>{' '}
                    ({tCommon(`statusValues.${report.aiVisibilityProgress.trend}`)})
                  </dd>
                  <dt>{t('entityCoverage')}</dt>
                  <dd>
                    {report.aiVisibilityProgress.entityCoverageChange.baseline} →{' '}
                    {report.aiVisibilityProgress.entityCoverageChange.verification}
                  </dd>
                </dl>
              )}
            </Card>
          </div>

          <Card title={t('evidence')}>
            <ul className="stack-sm">
              {report.evidence.map((fact, index) => (
                <li key={index} className="text-secondary">
                  {fact.label}: {fact.value}
                </li>
              ))}
            </ul>
          </Card>

          <ConclusionList title={t('risks')} conclusions={report.risks} t={t} tCommon={tCommon} />
          <ConclusionList title={t('recommendedNextCycleGoals')} conclusions={report.recommendedNextCycleGoals} t={t} tCommon={tCommon} />

          <div className="next-step">
            <div className="next-step__body">
              <p className="next-step__eyebrow">{t('whatsNext')}</p>
              <p className="next-step__description">
                {report.cycleStatus === 'completed' ? t('cycleCompleteMessage') : t('cycleInProgressMessage')}
              </p>
            </div>
            <Link
              href={report.cycleStatus === 'completed' ? '/workspace' : `/projects/${id}/dashboard`}
              className="btn btn-primary next-step__cta"
            >
              {report.cycleStatus === 'completed' ? t('goToWorkspace') : t('backToDashboard')}
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
