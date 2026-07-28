'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ClientMetadata, ProjectMetadata } from '@ai-visibility/contracts';
import { createAudit, AuditCompletionResult, CreateAuditState, listClients, listProjects } from '../../actions';
import { Badge, Banner, Breadcrumbs, Card, EmptyState, PageHeader, SkeletonBlock, statusToVariant } from '../../components/ui';
import { useTranslations } from '../../../lib/i18n/client';
import type { Translator } from '@ai-visibility/i18n';
import { ruleRationale, ruleResolutionStrategy, ruleTitle } from '../../lib/rule-text';

const initialState: CreateAuditState = {};

function AuditResultInspector({
  result,
  t,
  tAudits,
  tFindings,
  tOptimization,
  tCommon,
  tRules,
}: {
  result: AuditCompletionResult;
  t: Translator;
  tAudits: Translator;
  tFindings: Translator;
  tOptimization: Translator;
  tCommon: Translator;
  tRules: Translator;
}) {
  return (
    <Card title={t('auditCreated')}>
      <div className="cluster">
        <Badge variant={statusToVariant(result.status)}>{tCommon(`statusValues.${result.status}`)}</Badge>
        <span className="text-tertiary text-mono">{result.id}</span>
      </div>

      {result.executionHistory.length > 0 && (
        <div className="section">
          <h3>{t('workflowProgress')}</h3>
          <dl className="dl">
            <dt>{t('overallProgress')}</dt>
            <dd>
              {Math.round(
                (result.executionHistory.filter((step) => step.status === 'success').length / result.executionHistory.length) * 100,
              )}
              %
            </dd>
          </dl>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('step')}</th>
                  <th>{tCommon('status')}</th>
                  <th>{tAudits('duration')}</th>
                </tr>
              </thead>
              <tbody>
                {result.executionHistory.map((step) => (
                  <tr key={step.stepId}>
                    <td>{step.stepId}</td>
                    <td>
                      <Badge variant={statusToVariant(step.status)}>{tCommon(`statusValues.${step.status}`)}</Badge>
                    </td>
                    <td>{step.durationMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="section">
        <h3>{tFindings('title')}</h3>
        {result.findings.length === 0 && <EmptyState title={t('noFindingsForAudit')} />}
        {result.findings.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>{tFindings('rule')}</th>
                  <th>{tFindings('category')}</th>
                  <th>{tFindings('outcome')}</th>
                  <th>{tFindings('severity')}</th>
                </tr>
              </thead>
              <tbody>
                {result.findings.map((finding) => (
                  <tr key={finding.id}>
                    <td>{finding.ruleId}</td>
                    <td>{finding.category}</td>
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
      </div>

      <div className="section">
        <h3>{tOptimization('title')}</h3>
        {result.optimizationPlan.length === 0 && <EmptyState title={t('noOptimizationItems')} />}
        {result.optimizationPlan.map((item) => (
          <Card key={item.optimizationRuleId + item.supportingFindingIds.join(',')} muted>
            <div className="card__header">
              <h4>{ruleTitle(tRules, item.optimizationRuleId)}</h4>
              <Badge variant={statusToVariant(item.priority)}>{tCommon(`statusValues.${item.priority}`)}</Badge>
            </div>
            <p>{ruleResolutionStrategy(tRules, item.optimizationRuleId)}</p>
            <p className="text-secondary">{ruleRationale(tRules, item.optimizationRuleId)}</p>
            <dl className="dl">
              <dt>{tOptimization('expectedImpact')}</dt>
              <dd>{tCommon(`statusValues.${item.expectedImpact}`)}</dd>
              <dt>{tOptimization('estimatedEffort')}</dt>
              <dd>{tCommon(`statusValues.${item.estimatedEffort}`)}</dd>
            </dl>
          </Card>
        ))}
      </div>
    </Card>
  );
}

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const tNav = useTranslations('navigation');
  const tDashboard = useTranslations('dashboard');
  const tAudits = useTranslations('audits');
  const tFindings = useTranslations('findings');
  const tOptimization = useTranslations('optimization');
  const tCommon = useTranslations('common');
  const tRules = useTranslations('rules');
  const searchParams = useSearchParams();
  const clientIdFilter = searchParams.get('clientId');

  const [state, formAction, pending] = useActionState(createAudit, initialState);
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [clients, setClients] = useState<ClientMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    Promise.all([listProjects(), listClients()]).then(([nextProjects, nextClients]) => {
      setProjects(nextProjects);
      setClients(nextClients);
      setLoading(false);
    });
  };

  useEffect(refresh, [state.result]);

  const clientById = new Map(clients.map((client) => [client.id, client]));
  const visibleProjects = clientIdFilter ? projects.filter((project) => project.clientId === clientIdFilter) : projects;
  const filterLabel = clientIdFilter ? clientById.get(clientIdFilter)?.name : undefined;

  return (
    <main className="page">
      <Breadcrumbs items={[{ label: tNav('dashboard'), href: '/workspace' }, { label: t('title') }]} />
      <PageHeader
        title={t('title')}
        description={filterLabel ? t('descriptionForClient', { name: filterLabel }) : t('description')}
      />

      <Card title={t('runNewAudit')}>
        <form action={formAction} className="form-row">
          <input type="hidden" name="source" value="projects-page" />
          <div className="field" style={{ flex: '1 1 260px' }}>
            <label htmlFor="audit-url">{t('websiteUrlLabel')}</label>
            <input className="input" id="audit-url" type="url" name="url" placeholder="https://example.com" required />
          </div>
          <div className="field" style={{ flex: '1 1 200px' }}>
            <label htmlFor="audit-client">{t('client')}</label>
            <select className="select" id="audit-client" name="clientId" defaultValue="">
              <option value="">{t('autoCreateClient')}</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? t('analyzing') : t('analyze')}
          </button>
        </form>
        {state.error && <Banner variant="error">{state.error}</Banner>}
      </Card>

      {loading && (
        <Card>
          <SkeletonBlock lines={4} />
        </Card>
      )}

      {!loading && visibleProjects.length === 0 && <EmptyState title={t('noProjects')} />}

      {!loading && visibleProjects.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>{t('project')}</th>
                <th>{t('client')}</th>
                <th>{t('website')}</th>
                <th>{tDashboard('baseline')}</th>
                <th>
                  <span className="visually-hidden">{tCommon('actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{clientById.get(project.clientId)?.name ?? '—'}</td>
                  <td className="text-mono">{project.canonicalWebsite}</td>
                  <td>
                    {project.baselineAuditId ? (
                      <Badge variant="success">{tDashboard('set')}</Badge>
                    ) : (
                      <Badge variant="neutral">{tDashboard('notSet')}</Badge>
                    )}
                  </td>
                  <td>
                    <Link href={`/projects/${project.id}/dashboard`} className="btn btn-secondary btn-sm">
                      {t('openDashboard')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.result && (
        <AuditResultInspector
          result={state.result}
          t={t}
          tAudits={tAudits}
          tFindings={tFindings}
          tOptimization={tOptimization}
          tCommon={tCommon}
          tRules={tRules}
        />
      )}
    </main>
  );
}
