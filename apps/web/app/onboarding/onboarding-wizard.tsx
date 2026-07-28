'use client';

import { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import type { ClientMetadata } from '@ai-visibility/contracts';
import {
  createAudit,
  createClient,
  getAudit,
  getAuditAnalysis,
  listAudits,
  listClients,
  listProjects,
  CreateAuditState,
} from '../actions';
import { Badge, Banner, Card, EmptyState, StageProgress, statusToVariant } from '../components/ui';
import { useTranslations } from '../../lib/i18n/client';
import { ruleTitle } from '../lib/rule-text';
import {
  loadAgencyProfile,
  markOnboardingCompleted,
  saveAgencyProfile,
  type AgencyProfile,
} from '../lib/onboarding-storage';

type Step = 'welcome' | 'agency' | 'client' | 'audit' | 'report' | 'done';

const STEP_ORDER: Step[] = ['welcome', 'agency', 'client', 'audit', 'report', 'done'];

interface ReportSummary {
  aiVisibilityStatus: string | null;
  findingsCount: number;
  topFindings: { ruleId: string; severity: string }[];
  planItemsCount: number;
  topPlanItems: { optimizationRuleId: string; priority: string }[];
}

const initialAuditState: CreateAuditState = {};

export function OnboardingWizard() {
  const t = useTranslations('onboarding');
  const tCommon = useTranslations('common');
  const tRules = useTranslations('rules');
  const STEP_LABEL: Record<Step, string> = {
    welcome: t('steps.welcome'),
    agency: t('steps.agency'),
    client: t('steps.client'),
    audit: t('steps.audit'),
    report: t('steps.report'),
    done: t('steps.done'),
  };
  const [step, setStep] = useState<Step>('welcome');
  const [checkingProgress, setCheckingProgress] = useState(true);

  const [agencyProfile, setAgencyProfile] = useState<AgencyProfile | null>(null);
  const [agencyName, setAgencyName] = useState('');
  const [agencyWebsite, setAgencyWebsite] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [clientDomain, setClientDomain] = useState('');
  const [clientError, setClientError] = useState<string | undefined>(undefined);
  const [client, setClient] = useState<ClientMetadata | null>(null);

  const [auditState, auditFormAction, auditPending] = useActionState(createAudit, initialAuditState);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [dashboardHref, setDashboardHref] = useState<string | null>(null);
  const [auditHref, setAuditHref] = useState<string | null>(null);

  // Resume support: a returning visitor who already has a Client and a completed Audit shouldn't
  // have to repeat steps that already happened outside this wizard (e.g. via the Workspace's own
  // forms). This reads only already-existing data — no new business logic, no new API calls.
  useEffect(() => {
    setAgencyProfile(loadAgencyProfile());

    Promise.all([listClients(), listAudits()]).then(async ([clients, audits]) => {
      if (clients.length === 0) {
        setCheckingProgress(false);
        return;
      }

      const completedAudits = audits
        .filter((audit) => audit.status === 'completed')
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
      const completedAudit = completedAudits[0];

      if (!completedAudit) {
        setClient(clients[0]);
        setStep('audit');
        setCheckingProgress(false);
        return;
      }

      const [analysis, projects] = await Promise.all([getAuditAnalysis(completedAudit.id), listProjects()]);
      const project = projects.find((candidate) => candidate.id === completedAudit.projectId);
      const owningClient = clients.find((candidate) => candidate.id === project?.clientId) ?? clients[0];
      setClient(owningClient);

      setReport(summarizeFromAnalysis(completedAudit.aiVisibilityStatus, analysis?.findings ?? [], analysis?.optimizationPlan ?? []));
      setDashboardHref(project ? `/projects/${project.id}/dashboard` : null);
      setAuditHref(`/audits/${completedAudit.id}`);
      setStep('done');
      setCheckingProgress(false);
    });
  }, []);

  useEffect(() => {
    if (!auditState.result) {
      return;
    }

    const findings = auditState.result.findings;
    const planItems = auditState.result.optimizationPlan;
    setReport(summarizeFromAnalysis(auditState.result.aiVisibilityStatus, findings, planItems));
    setAuditHref(`/audits/${auditState.result.id}`);

    getAudit(auditState.result.id).then((audit) => {
      if (audit) {
        setDashboardHref(`/projects/${audit.projectId}/dashboard`);
      }
    });

    setStep('report');
  }, [auditState.result]);

  const handleSaveAgency = (event: React.FormEvent) => {
    event.preventDefault();
    const profile: AgencyProfile = { name: agencyName.trim(), website: agencyWebsite.trim() || undefined };
    saveAgencyProfile(profile);
    setAgencyProfile(profile);
    setStep('client');
  };

  const handleCreateClient = async (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(undefined);

    const { error } = await createClient(clientName.trim(), clientIndustry.trim(), clientDomain.trim());
    if (error) {
      setClientError(error);
      return;
    }

    const clients = await listClients();
    const created = clients.find((candidate) => candidate.primaryDomain === clientDomain.trim()) ?? clients[0];
    setClient(created ?? null);
    setStep('audit');
  };

  const handleFinish = () => {
    markOnboardingCompleted();
    setStep('done');
  };

  if (checkingProgress) {
    return (
      <Card>
        <p className="text-secondary">{t('checkingWorkspace')}</p>
      </Card>
    );
  }

  return (
    <div className="stack">
      <StageProgress stages={STEP_ORDER.map((candidate) => STEP_LABEL[candidate])} current={STEP_LABEL[step]} />

      {step === 'welcome' && (
        <Card title={t('welcomeTitle')}>
          <p>{t('welcomeBody')}</p>
          <button type="button" className="btn btn-primary" onClick={() => setStep('agency')}>
            {t('getStarted')}
          </button>
        </Card>
      )}

      {step === 'agency' && (
        <Card title={t('agencyTitle')}>
          <p className="text-secondary">{t('agencyIntro')}</p>
          <form onSubmit={handleSaveAgency} className="form-row">
            <div className="field" style={{ flex: '1 1 240px' }}>
              <label htmlFor="agency-name">{t('agencyNameLabel')}</label>
              <input
                className="input"
                id="agency-name"
                type="text"
                value={agencyName}
                onChange={(event) => setAgencyName(event.target.value)}
                placeholder="Bright Digital Agency"
                required
              />
            </div>
            <div className="field" style={{ flex: '1 1 240px' }}>
              <label htmlFor="agency-website">{t('agencyWebsiteLabel')}</label>
              <input
                className="input"
                id="agency-website"
                type="text"
                value={agencyWebsite}
                onChange={(event) => setAgencyWebsite(event.target.value)}
                placeholder="https://brightdigital.example"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {t('continue')}
            </button>
          </form>
        </Card>
      )}

      {step === 'client' && (
        <Card title={t('clientTitle')}>
          <p className="text-secondary">
            {agencyProfile?.name
              ? t('clientIntroWithAgency', { agencyName: agencyProfile.name })
              : t('clientIntro')}
          </p>
          <form onSubmit={handleCreateClient} className="form-row">
            <div className="field" style={{ flex: '1 1 200px' }}>
              <label htmlFor="onboarding-client-name">{t('clientNameLabel')}</label>
              <input
                className="input"
                id="onboarding-client-name"
                type="text"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                placeholder="Acme Digital"
                required
              />
            </div>
            <div className="field" style={{ flex: '1 1 160px' }}>
              <label htmlFor="onboarding-client-industry">{t('industryLabel')}</label>
              <input
                className="input"
                id="onboarding-client-industry"
                type="text"
                value={clientIndustry}
                onChange={(event) => setClientIndustry(event.target.value)}
                placeholder="Retail"
                required
              />
            </div>
            <div className="field" style={{ flex: '1 1 200px' }}>
              <label htmlFor="onboarding-client-domain">{t('primaryDomainLabel')}</label>
              <input
                className="input"
                id="onboarding-client-domain"
                type="text"
                value={clientDomain}
                onChange={(event) => setClientDomain(event.target.value)}
                placeholder="example.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {t('continue')}
            </button>
          </form>
          {clientError && <Banner variant="error">{clientError}</Banner>}
        </Card>
      )}

      {step === 'audit' && (
        <Card title={t('auditTitle')}>
          <p className="text-secondary">{t('auditIntro', { clientName: client ? client.name : t('yourClient') })}</p>
          <form action={auditFormAction} className="form-row">
            <input type="hidden" name="source" value="onboarding" />
            {client && <input type="hidden" name="clientId" value={client.id} />}
            <div className="field" style={{ flex: '1 1 260px' }}>
              <label htmlFor="onboarding-audit-url">{t('websiteUrlLabel')}</label>
              <input
                className="input"
                id="onboarding-audit-url"
                type="url"
                name="url"
                placeholder="https://example.com"
                required
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={auditPending}>
              {auditPending ? t('analyzing') : t('runFirstAudit')}
            </button>
          </form>
          {auditState.error && <Banner variant="error">{auditState.error}</Banner>}
        </Card>
      )}

      {step === 'report' && report && (
        <Card title={t('reportTitle')}>
          <p className="text-secondary">
            {t('reportIntro', { clientName: client ? client.name : t('yourClient') })}
          </p>
          <dl className="dl">
            <dt>{t('aiVisibilityStatus')}</dt>
            <dd>
              {report.aiVisibilityStatus ? (
                <Badge variant={statusToVariant(report.aiVisibilityStatus)}>
                  {tCommon(`statusValues.${report.aiVisibilityStatus}`)}
                </Badge>
              ) : (
                '—'
              )}
            </dd>
            <dt>{t('findings')}</dt>
            <dd>{report.findingsCount}</dd>
            <dt>{t('optimizationOpportunities')}</dt>
            <dd>{report.planItemsCount}</dd>
          </dl>

          {report.topFindings.length > 0 && (
            <div className="section">
              <h4>{t('topFindings')}</h4>
              <ul className="stack-sm">
                {report.topFindings.map((finding, index) => (
                  <li key={index} className="text-secondary">
                    {finding.ruleId} —{' '}
                    <Badge variant={statusToVariant(finding.severity)}>{tCommon(`statusValues.${finding.severity}`)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.topPlanItems.length > 0 && (
            <div className="section">
              <h4>{t('topOpportunities')}</h4>
              <ul className="stack-sm">
                {report.topPlanItems.map((item, index) => (
                  <li key={index}>
                    {ruleTitle(tRules, item.optimizationRuleId)} —{' '}
                    <Badge variant={statusToVariant(item.priority)}>{tCommon(`statusValues.${item.priority}`)}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.findingsCount === 0 && report.planItemsCount === 0 && (
            <EmptyState title={t('nothingFlaggedTitle')} description={t('nothingFlaggedDescription')} />
          )}

          <button type="button" className="btn btn-primary" onClick={handleFinish}>
            {t('continue')}
          </button>
        </Card>
      )}

      {step === 'done' && (
        <Card title={t('doneTitle')}>
          <p className="text-secondary">{t('doneIntro')}</p>
          <ul className="stack-sm">
            {agencyProfile?.name && <li>✓ {t('agencyProfileSaved', { agencyName: agencyProfile.name })}</li>}
            <li>✓ {client ? t('firstClientNamed', { name: client.name }) : t('firstClientGeneric')}</li>
            <li>✓ {t('workspaceCreated')}</li>
            <li>✓ {t('firstAuditCompleted')}</li>
            <li>✓ {t('firstReportGenerated')}</li>
          </ul>
          <div className="cluster">
            {dashboardHref && (
              <Link href={dashboardHref} className="btn btn-primary">
                {t('goToDashboard')}
              </Link>
            )}
            {auditHref && (
              <Link href={auditHref} className="btn btn-secondary">
                {t('viewFullReport')}
              </Link>
            )}
            <Link href="/workspace" className="btn btn-ghost">
              {t('backToWorkspace')}
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function summarizeFromAnalysis(
  aiVisibilityStatus: string | null,
  findings: { ruleId: string; severity: string }[],
  planItems: { optimizationRuleId: string; priority: string }[],
): ReportSummary {
  return {
    aiVisibilityStatus,
    findingsCount: findings.length,
    topFindings: findings.slice(0, 3).map((finding) => ({ ruleId: finding.ruleId, severity: finding.severity })),
    planItemsCount: planItems.length,
    topPlanItems: planItems.slice(0, 3).map((item) => ({ optimizationRuleId: item.optimizationRuleId, priority: item.priority })),
  };
}
