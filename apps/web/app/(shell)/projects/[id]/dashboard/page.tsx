import Link from 'next/link';
import { getDashboard } from '../../../../actions';
import { CycleManager } from './cycle-manager';
import { Badge, Breadcrumbs, Card, EmptyState, NextStepBanner, PageHeader, statusToVariant } from '../../../../components/ui';
import { ScoresPanel, ScoresSummaryBadge } from '../../../../components/scores-panel';
import { RecommendationExplainability } from '../../../../components/recommendation-explainability';
import { RunAuditModal } from '../../../../components/run-audit-modal';
import { findRuleExplanationForItem } from '../../../../lib/recommendation-explainability';
import { computeNextStep } from '../../../../lib/next-step';
import { ReauditChangedPagesButton } from './reaudit-changed-pages-button';
import { getTranslations } from '../../../../../lib/i18n/server';
import { assumptionDescription, ruleRationale, ruleResolutionStrategy, ruleTitle } from '../../../../lib/rule-text';

export default async function ExecutiveDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = await getDashboard(id);
  const t = await getTranslations('dashboard');
  const tNav = await getTranslations('navigation');
  const tPages = await getTranslations('pages');
  const tOptimization = await getTranslations('optimization');
  const tAudits = await getTranslations('audits');
  const tCommon = await getTranslations('common');
  const tFindings = await getTranslations('findings');
  const tRules = await getTranslations('rules');
  const notApplicable = tAudits('notApplicable');

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: dashboard?.project.projectName ?? tNav('projects') }]} />

      <PageHeader
        title={t('title')}
        description={dashboard ? `${dashboard.project.clientName} · ${dashboard.project.primaryDomain}` : undefined}
        actions={
          <div className="cluster">
            <RunAuditModal defaultUrl={dashboard?.project.canonicalWebsite} source="dashboard" />
            {dashboard?.project.baselineAuditUrl && (
              <RunAuditModal
                defaultUrl={dashboard.project.baselineAuditUrl}
                source="run-from-baseline"
                triggerLabel={t('runFromBaseline')}
              />
            )}
            <Link href={`/projects/${id}/pages`} className="btn btn-secondary">
              {t('viewPages')}
            </Link>
            <Link href={`/projects/${id}/site-explorer`} className="btn btn-secondary">
              {tPages('siteExplorer')}
            </Link>
            <Link href={`/projects/${id}/compare`} className="btn btn-secondary">
              {tPages('compareAuditsTitle')}
            </Link>
            <Link href={`/projects/${id}/consultant`} className="btn btn-secondary">
              {t('askAiConsultant')}
            </Link>
          </div>
        }
      />

      {!dashboard && (
        <Card>
          <EmptyState title={t('dashboardNotAvailable')} description={t('dashboardNotAvailableDescription')} />
        </Card>
      )}

      {dashboard && (
        <div className="stack">
          <NextStepBanner step={computeNextStep(dashboard, id)} />

          <Card
            title={t('projectOverview')}
            actions={
              <div className="cluster">
                <RunAuditModal defaultUrl={dashboard.project.canonicalWebsite} source="project-overview" />
                <ReauditChangedPagesButton projectId={id} />
              </div>
            }
          >
            <dl className="dl">
              <dt>{t('projectLabel')}</dt>
              <dd>{dashboard.project.projectName}</dd>
              <dt>{t('clientLabel')}</dt>
              <dd>{dashboard.project.clientName}</dd>
              <dt>{t('primaryDomainLabel')}</dt>
              <dd>{dashboard.project.primaryDomain}</dd>
              <dt>{t('baseline')}</dt>
              <dd>{dashboard.project.baselineAuditId ? <Badge variant="success">{t('set')}</Badge> : <Badge>{t('notSet')}</Badge>}</dd>
              <dt>{t('baselineSetAt')}</dt>
              <dd>{dashboard.project.baselineSetAt ?? notApplicable}</dd>
              <dt>{t('latestAudit')}</dt>
              <dd>{dashboard.project.latestAuditId ?? notApplicable}</dd>
            </dl>
          </Card>

          <Card title={t('currentOptimizationCycle')} description={t('currentOptimizationCycleDescription')}>
            <CycleManager projectId={id} />
          </Card>

          <div className="grid-2">
            <Card title={t('visibilityOverview')}>
              <dl className="dl">
                <dt>{t('overallScore')}</dt>
                <dd>
                  <ScoresSummaryBadge scores={dashboard.scores} />
                </dd>
                <dt>{t('aiVisibilityScore')}</dt>
                <dd>
                  {dashboard.visibility.currentScore ? (
                    <Badge variant={statusToVariant(dashboard.visibility.currentScore)}>
                      {tCommon(`statusValues.${dashboard.visibility.currentScore}`)}
                    </Badge>
                  ) : (
                    notApplicable
                  )}
                </dd>
                <dt>{t('baselineScore')}</dt>
                <dd>
                  {dashboard.visibility.baselineScore ? (
                    <Badge variant={statusToVariant(dashboard.visibility.baselineScore)}>
                      {tCommon(`statusValues.${dashboard.visibility.baselineScore}`)}
                    </Badge>
                  ) : (
                    notApplicable
                  )}
                </dd>
                <dt>{t('scoreTrend')}</dt>
                <dd>
                  <Badge variant={statusToVariant(dashboard.visibility.scoreTrend)}>
                    {tCommon(`statusValues.${dashboard.visibility.scoreTrend}`)}
                  </Badge>
                </dd>
                <dt>{t('totalFindings')}</dt>
                <dd>{dashboard.visibility.totalFindings}</dd>
                <dt>{t('criticalFindings')}</dt>
                <dd>{dashboard.visibility.criticalFindings}</dd>
                <dt>{t('opportunities')}</dt>
                <dd>{dashboard.visibility.opportunities}</dd>
              </dl>
            </Card>

            <Card title={t('recentActivity')}>
              <dl className="dl">
                <dt>{t('latestCompletedAudit')}</dt>
                <dd>{dashboard.recentActivity.latestCompletedAuditId ?? notApplicable}</dd>
                <dt>{t('completedAt')}</dt>
                <dd>{dashboard.recentActivity.latestCompletedAuditDate ?? notApplicable}</dd>
                <dt>{t('lastBaselineChange')}</dt>
                <dd>{dashboard.recentActivity.lastBaselineChangeAuditId ?? notApplicable}</dd>
                <dt>{t('changedAt')}</dt>
                <dd>{dashboard.recentActivity.lastBaselineChangeAt ?? notApplicable}</dd>
                <dt>{t('lastExecution')}</dt>
                <dd>
                  {dashboard.recentActivity.lastExecutionStatus ? (
                    <Badge variant={statusToVariant(dashboard.recentActivity.lastExecutionStatus)}>
                      {tCommon(`statusValues.${dashboard.recentActivity.lastExecutionStatus}`)}
                    </Badge>
                  ) : (
                    notApplicable
                  )}
                </dd>
                <dt>{t('executedAt')}</dt>
                <dd>{dashboard.recentActivity.lastExecutionAt ?? notApplicable}</dd>
              </dl>
            </Card>
          </div>

          {dashboard.scores ? (
            <ScoresPanel scores={dashboard.scores} />
          ) : (
            <Card title={tFindings('scoresTitle')}>
              <EmptyState title={t('noScoresYet')} description={t('noScoresDescription')} />
            </Card>
          )}

          <Card title={t('optimizationPlanPriorityActions')}>
            {dashboard.priorityActions.length === 0 && (
              <EmptyState title={t('noPriorityActions')} description={t('noPriorityActionsDescription')} />
            )}
            <div className="stack">
              {dashboard.priorityActions.map((action, index) => (
                <Card key={`${action.optimizationRuleId}-${index}`} muted>
                  <div className="card__header">
                    <h4>{ruleTitle(tRules, action.optimizationRuleId)}</h4>
                    <Badge variant={statusToVariant(action.priority)}>{tCommon(`statusValues.${action.priority}`)}</Badge>
                  </div>
                  <p>{ruleResolutionStrategy(tRules, action.optimizationRuleId)}</p>
                  <p className="text-secondary">{ruleRationale(tRules, action.optimizationRuleId)}</p>
                  <dl className="dl">
                    <dt>{tOptimization('expectedImpact')}</dt>
                    <dd>{tCommon(`statusValues.${action.expectedImpact}`)}</dd>
                    <dt>{tOptimization('estimatedEffort')}</dt>
                    <dd>{tCommon(`statusValues.${action.estimatedEffort}`)}</dd>
                    <dt>{tOptimization('supportingFindings')}</dt>
                    <dd>{action.supportingFindingIds.join(', ') || t('none')}</dd>
                    <dt>{tOptimization('optimizationRule')}</dt>
                    <dd>
                      {action.optimizationRuleId} (v{action.optimizationRuleVersion})
                    </dd>
                  </dl>
                  <details>
                    <summary>{t('reasoningLabel')}</summary>
                    <div className="stack-sm">
                      <p>
                        <strong>{t('whyThisActionExists')}</strong>
                      </p>
                      <ul className="stack-sm">
                        {action.reasoning.triggeringFindings.map((finding) => (
                          <li key={finding.findingId} className="text-secondary">
                            {t('findingReasoningLine', {
                              id: finding.findingId,
                              ruleId: finding.ruleId,
                              category: finding.category,
                              sourceEngine: finding.sourceEngine,
                              outcome: finding.outcome,
                            })}
                          </li>
                        ))}
                        {action.reasoning.appliedRules.map((rule) => (
                          <li key={`${rule.ruleId}-${rule.ruleVersion}`} className="text-secondary">
                            {t('appliedRuleLine', {
                              ruleId: rule.ruleId,
                              version: rule.ruleVersion,
                              category: rule.category,
                              severity: tCommon(`statusValues.${rule.severity}`),
                            })}
                          </li>
                        ))}
                      </ul>
                      <p>
                        <strong>{t('whatEvidenceSupports')}</strong>
                      </p>
                      {action.reasoning.evidence.length === 0 && <p className="text-secondary">{t('noEvidenceFacts')}</p>}
                      <ul className="stack-sm">
                        {action.reasoning.evidence.map((entry, entryIndex) => (
                          <li key={`${entry.field}-${entryIndex}`} className="text-secondary">
                            {entry.field}: {entry.value}
                          </li>
                        ))}
                      </ul>
                      <p className="text-secondary">
                        {t('knowledgeGraphFacts')}{' '}
                        {action.reasoning.knowledgeGraphFacts.map((fact) => `${fact.dimension}=${fact.level}`).join(', ') || t('none')}
                      </p>
                      <p className="text-secondary">
                        {t('entityRelationships')}{' '}
                        {action.reasoning.entityRelationships.length === 0
                          ? t('notApplicableToRule')
                          : action.reasoning.entityRelationships
                              .map((rel) => `${rel.sourceEntityName} -${rel.relationshipType}-> ${rel.targetEntityName}`)
                              .join(', ')}
                      </p>
                      <p>
                        <strong>{t('expectedBenefit')}</strong>
                      </p>
                      <p className="text-secondary">
                        {t('impactLevelOn', {
                          level: tCommon(`statusValues.${action.reasoning.expectedOutcome.impactLevel}`),
                          dimension: action.reasoning.expectedOutcome.targetDimension,
                        })}
                      </p>
                      <p className="text-secondary">
                        {t('confidenceColon', { confidence: tCommon(`statusValues.${action.reasoning.confidence}`) })}
                      </p>
                      <p>{t('assumptions')}</p>
                      <ul className="stack-sm">
                        {action.reasoning.assumptions.map((assumption) => (
                          <li key={assumption.code} className="text-secondary">
                            [{assumption.code}] {assumptionDescription(tRules, assumption.code)}
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
              title={tOptimization('campaign')}
              actions={
                <Link href={`/projects/${id}/campaign`} className="btn btn-secondary btn-sm">
                  {tOptimization('manageCampaign')}
                </Link>
              }
            >
              {!dashboard.campaign && (
                <EmptyState
                  title={tOptimization('noCampaign')}
                  description={tOptimization('createCampaignDescription')}
                  action={
                    <Link href={`/projects/${id}/campaign`} className="btn btn-primary btn-sm">
                      {tOptimization('createCampaign')}
                    </Link>
                  }
                />
              )}
              {dashboard.campaign && (
                <dl className="dl">
                  <dt>{tCommon('status')}</dt>
                  <dd>
                    <Badge variant={statusToVariant(dashboard.campaign.status)}>{tCommon(`statusValues.${dashboard.campaign.status}`)}</Badge>
                  </dd>
                  <dt>{t('totalActions')}</dt>
                  <dd>{dashboard.campaign.totalActions}</dd>
                  <dt>{t('pendingActionsLabel')}</dt>
                  <dd>{dashboard.campaign.pendingActions}</dd>
                  <dt>{t('inProgress')}</dt>
                  <dd>{dashboard.campaign.inProgressActions}</dd>
                  <dt>{tCommon('statusValues.completed')}</dt>
                  <dd>{dashboard.campaign.completedActions}</dd>
                  <dt>{tCommon('statusValues.verified')}</dt>
                  <dd>{dashboard.campaign.verifiedActions}</dd>
                  <dt>{tAudits('progress')}</dt>
                  <dd>{dashboard.campaign.progressPercentage}%</dd>
                </dl>
              )}
            </Card>

            <Card title={tOptimization('impact')}>
              {!dashboard.campaignImpact && (
                <EmptyState title={t('noImpactAssessment')} description={t('noImpactAssessmentDescription')} />
              )}
              {dashboard.campaignImpact && (
                <div className="stack-sm">
                  <dl className="dl">
                    <dt>{t('verificationDate')}</dt>
                    <dd>{dashboard.campaignImpact.verificationDate}</dd>
                    <dt>{t('aiVisibilityTrend')}</dt>
                    <dd>
                      <Badge variant={statusToVariant(dashboard.campaignImpact.aiVisibilityTrend)}>
                        {tCommon(`statusValues.${dashboard.campaignImpact.aiVisibilityTrend}`)}
                      </Badge>
                    </dd>
                    <dt>{t('findingsResolved')}</dt>
                    <dd>{dashboard.campaignImpact.findingsResolvedCount}</dd>
                    <dt>{t('findingsIntroduced')}</dt>
                    <dd>{dashboard.campaignImpact.findingsIntroducedCount}</dd>
                    <dt>{t('remainingOpportunities')}</dt>
                    <dd>{dashboard.campaignImpact.remainingOpportunitiesCount}</dd>
                  </dl>
                  <h4>{t('improvementSummary')}</h4>
                  {dashboard.campaignImpact.improvements.length === 0 && <p className="text-secondary">{t('noImprovementsYet')}</p>}
                  <ul className="stack-sm">
                    {dashboard.campaignImpact.improvements.map((entry, index) => (
                      <li key={`${entry.category}-${index}`} className="text-secondary">
                        <Badge variant="neutral">{tCommon(`statusValues.${entry.category}`)}</Badge>{' '}
                        {tRules(entry.messageKey, entry.parameters)}
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
