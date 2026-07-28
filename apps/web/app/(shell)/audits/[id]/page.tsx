import Link from 'next/link';
import { getAudit, getAuditAnalysis } from '../../../actions';
import { Badge, Breadcrumbs, Card, EmptyState, PageHeader, statusToVariant } from '../../../components/ui';
import { RunAuditModal } from '../../../components/run-audit-modal';
import { ScoresPanel } from '../../../components/scores-panel';
import { RecommendationExplainability } from '../../../components/recommendation-explainability';
import { findRuleExplanationForItem } from '../../../lib/recommendation-explainability';
import { DetailSectionCard } from './detail-section-card';
import { ExecutionTimeline } from './execution-timeline';
import { buildDetailSections, externalLinksSignal, findRuleByRuleId, findSignalByKey } from './page-detail';
import { getTranslations } from '../../../../lib/i18n/server';
import { ruleResolutionStrategy, ruleTitle } from '../../../lib/rule-text';

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAudit(id);
  const analysis = audit?.status === 'completed' ? await getAuditAnalysis(id) : null;
  const t = await getTranslations('audits');
  const tNav = await getTranslations('navigation');
  const tFindings = await getTranslations('findings');
  const tOptimization = await getTranslations('optimization');
  const tCommon = await getTranslations('common');
  const tRules = await getTranslations('rules');

  const indexabilityRule = analysis ? findRuleByRuleId(analysis, 'seo-indexability') : undefined;
  const indexabilitySignal = findSignalByKey(indexabilityRule, 'indexability');
  const canonicalSignal = findSignalByKey(indexabilityRule, 'canonical');
  const detailSections = analysis ? buildDetailSections(analysis) : [];
  const externalLinks = analysis ? externalLinksSignal(analysis) : undefined;

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: t('auditId') }]} />

      <PageHeader
        title={t('pageDetail')}
        description={audit?.url}
        actions={
          audit && (
            <div className="cluster">
              <RunAuditModal defaultUrl={audit.url} source="run-again" triggerLabel={t('runAgain')} />
              <Link href={`/projects/${audit.projectId}/dashboard`} className="btn btn-primary">
                {t('viewProjectDashboard')}
              </Link>
            </div>
          )
        }
      />

      {!audit && (
        <Card>
          <EmptyState title={t('auditNotFound')} />
        </Card>
      )}

      {audit && (
        <div className="stack">
          <Card title={t('overview')}>
            <dl className="dl">
              <dt>{t('urlLabel')}</dt>
              <dd className="text-mono">{audit.url}</dd>
              <dt>{t('httpStatus')}</dt>
              <dd>{typeof indexabilitySignal?.data.httpStatus === 'number' ? indexabilitySignal.data.httpStatus : t('notApplicable')}</dd>
              <dt>{t('canonical')}</dt>
              <dd className="text-mono">
                {typeof canonicalSignal?.data.canonicalUrl === 'string' ? canonicalSignal.data.canonicalUrl : tCommon('notSet')}
              </dd>
              <dt>{t('indexability')}</dt>
              <dd>
                {indexabilityRule ? (
                  <Badge variant={indexabilityRule.finding.evidence.isIndexable ? 'success' : 'danger'}>
                    {indexabilityRule.finding.evidence.isIndexable ? t('indexable') : t('blocked')}
                  </Badge>
                ) : (
                  t('notApplicable')
                )}
              </dd>
              <dt>{t('crawlDate')}</dt>
              <dd>{audit.completedAt ?? t('notApplicable')}</dd>
            </dl>
          </Card>

          <ExecutionTimeline audit={audit} />

          {audit.status === 'completed' && (
            <>
              {analysis && <ScoresPanel scores={analysis.scores} />}

              {detailSections.map((section) => (
                <DetailSectionCard key={section.key} section={section} />
              ))}

              <Card title={t('externalLinksTitle')} description={t('externalLinksDescription')}>
                {externalLinks ? (
                  <dl className="dl">
                    <dt>{t('externalLinksLabel')}</dt>
                    <dd>{typeof externalLinks.data.externalLinkCount === 'number' ? externalLinks.data.externalLinkCount : t('notApplicable')}</dd>
                  </dl>
                ) : (
                  <EmptyState title={t('noDataTitle')} description={t('noSignalAvailable')} />
                )}
              </Card>

              <Card title={tFindings('title')}>
                {(!analysis || analysis.findings.length === 0) && (
                  <EmptyState title={tFindings('noFindings')} description={t('nothingToFixDescription')} />
                )}
                {analysis && analysis.findings.length > 0 && (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{tFindings('rule')}</th>
                          <th>{tFindings('category')}</th>
                          <th>{tFindings('sourceEngine')}</th>
                          <th>{tFindings('outcome')}</th>
                          <th>{tFindings('severity')}</th>
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
                              <Badge variant={statusToVariant(finding.outcome)}>{tFindings(finding.outcome)}</Badge>
                            </td>
                            <td>
                              <Badge variant={statusToVariant(finding.severity)}>{tCommon(`statusValues.${finding.severity}`)}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              <Card title={t('recommendations')}>
                {(!analysis || analysis.optimizationPlan.length === 0) && <EmptyState title={tOptimization('noOptimizationItems')} />}
                <div className="stack">
                  {analysis?.optimizationPlan.map((item, index) => (
                    <Card key={`${item.optimizationRuleId}-${index}`} muted>
                      <div className="card__header">
                        <h4>{ruleTitle(tRules, item.optimizationRuleId)}</h4>
                        <Badge variant={statusToVariant(item.priority)}>{tCommon(`statusValues.${item.priority}`)}</Badge>
                      </div>
                      <p>{ruleResolutionStrategy(tRules, item.optimizationRuleId)}</p>
                      <dl className="dl">
                        <dt>{tOptimization('expectedImpact')}</dt>
                        <dd>{tCommon(`statusValues.${item.expectedImpact}`)}</dd>
                        <dt>{tOptimization('estimatedEffort')}</dt>
                        <dd>{tCommon(`statusValues.${item.estimatedEffort}`)}</dd>
                        <dt>{tOptimization('optimizationRule')}</dt>
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
