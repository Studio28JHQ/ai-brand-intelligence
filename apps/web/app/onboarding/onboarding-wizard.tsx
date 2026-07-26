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
import { Badge, Banner, Card, EmptyState, StageProgress } from '../components/ui';
import {
  loadAgencyProfile,
  markOnboardingCompleted,
  saveAgencyProfile,
  type AgencyProfile,
} from '../lib/onboarding-storage';

type Step = 'welcome' | 'agency' | 'client' | 'audit' | 'report' | 'done';

const STEP_ORDER: Step[] = ['welcome', 'agency', 'client', 'audit', 'report', 'done'];
const STEP_LABEL: Record<Step, string> = {
  welcome: 'Welcome',
  agency: 'Your Agency',
  client: 'First Client',
  audit: 'First Audit',
  report: 'Your Report',
  done: 'Done',
};

interface ReportSummary {
  aiVisibilityStatus: string | null;
  findingsCount: number;
  topFindings: { ruleId: string; severity: string }[];
  planItemsCount: number;
  topPlanItems: { title: string; priority: string }[];
}

const initialAuditState: CreateAuditState = {};

export function OnboardingWizard() {
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

    const findings = auditState.result.analysis?.findings ?? [];
    const planItems = auditState.result.optimizationPlan?.items ?? [];
    setReport(summarizeFromAnalysis(auditState.result.aiVisibility?.status ?? null, findings, planItems));
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
        <p className="text-secondary">Checking your workspace…</p>
      </Card>
    );
  }

  return (
    <div className="stack">
      <StageProgress stages={STEP_ORDER.map((candidate) => STEP_LABEL[candidate])} current={STEP_LABEL[step]} />

      {step === 'welcome' && (
        <Card title="Welcome to AI Visibility Auditor">
          <p>
            In a few minutes you&apos;ll set up your agency, add your first client, run their first Audit, and see
            your first AI Visibility report — no setup required beyond entering your client&apos;s website.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setStep('agency')}>
            Get Started
          </button>
        </Card>
      )}

      {step === 'agency' && (
        <Card title="Your Agency">
          <p className="text-secondary">Tell us a little about your agency. This personalizes your workspace.</p>
          <form onSubmit={handleSaveAgency} className="form-row">
            <div className="field" style={{ flex: '1 1 240px' }}>
              <label htmlFor="agency-name">Agency name</label>
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
              <label htmlFor="agency-website">Agency website (optional)</label>
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
              Continue
            </button>
          </form>
        </Card>
      )}

      {step === 'client' && (
        <Card title="Your First Client">
          <p className="text-secondary">
            Add the business whose AI Visibility you&apos;ll be auditing{agencyProfile?.name ? ` for ${agencyProfile.name}` : ''}.
          </p>
          <form onSubmit={handleCreateClient} className="form-row">
            <div className="field" style={{ flex: '1 1 200px' }}>
              <label htmlFor="onboarding-client-name">Client name</label>
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
              <label htmlFor="onboarding-client-industry">Industry</label>
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
              <label htmlFor="onboarding-client-domain">Primary domain</label>
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
              Continue
            </button>
          </form>
          {clientError && <Banner variant="error">{clientError}</Banner>}
        </Card>
      )}

      {step === 'audit' && (
        <Card title="Your First Audit">
          <p className="text-secondary">
            Enter {client ? client.name : 'your client'}&apos;s website. We&apos;ll automatically set up their
            workspace and run a complete AI Visibility Audit — this takes a few seconds.
          </p>
          <form action={auditFormAction} className="form-row">
            {client && <input type="hidden" name="clientId" value={client.id} />}
            <div className="field" style={{ flex: '1 1 260px' }}>
              <label htmlFor="onboarding-audit-url">Website URL</label>
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
              {auditPending ? 'Analyzing…' : 'Run My First Audit'}
            </button>
          </form>
          {auditState.error && <Banner variant="error">{auditState.error}</Banner>}
        </Card>
      )}

      {step === 'report' && report && (
        <Card title="Your First AI Visibility Report">
          <p className="text-secondary">
            Here&apos;s a complete picture of how AI systems see {client ? client.name : 'your client'}&apos;s
            website today.
          </p>
          <dl className="dl">
            <dt>AI Visibility Status</dt>
            <dd>{report.aiVisibilityStatus ? <Badge>{report.aiVisibilityStatus}</Badge> : '—'}</dd>
            <dt>Findings</dt>
            <dd>{report.findingsCount}</dd>
            <dt>Optimization Opportunities</dt>
            <dd>{report.planItemsCount}</dd>
          </dl>

          {report.topFindings.length > 0 && (
            <div className="section">
              <h4>Top Findings</h4>
              <ul className="stack-sm">
                {report.topFindings.map((finding, index) => (
                  <li key={index} className="text-secondary">
                    {finding.ruleId} — <Badge>{finding.severity}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.topPlanItems.length > 0 && (
            <div className="section">
              <h4>Top Opportunities</h4>
              <ul className="stack-sm">
                {report.topPlanItems.map((item, index) => (
                  <li key={index}>
                    {item.title} — <Badge>{item.priority}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.findingsCount === 0 && report.planItemsCount === 0 && (
            <EmptyState title="Nothing flagged yet" description="This site is already in great shape." />
          )}

          <button type="button" className="btn btn-primary" onClick={handleFinish}>
            Continue
          </button>
        </Card>
      )}

      {step === 'done' && (
        <Card title="You're All Set">
          <p className="text-secondary">Your workspace is ready. Here&apos;s what we set up for you:</p>
          <ul className="stack-sm">
            {agencyProfile?.name && <li>✓ Agency profile saved for {agencyProfile.name}</li>}
            <li>✓ First client{client ? ` — ${client.name}` : ' added'}</li>
            <li>✓ Workspace and project created automatically</li>
            <li>✓ First Audit completed</li>
            <li>✓ First AI Visibility report generated</li>
          </ul>
          <div className="cluster">
            {dashboardHref && (
              <Link href={dashboardHref} className="btn btn-primary">
                Go to Your Dashboard
              </Link>
            )}
            {auditHref && (
              <Link href={auditHref} className="btn btn-secondary">
                View Full Report
              </Link>
            )}
            <Link href="/" className="btn btn-ghost">
              Back to Workspace
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
  planItems: { title: string; priority: string }[],
): ReportSummary {
  return {
    aiVisibilityStatus,
    findingsCount: findings.length,
    topFindings: findings.slice(0, 3).map((finding) => ({ ruleId: finding.ruleId, severity: finding.severity })),
    planItemsCount: planItems.length,
    topPlanItems: planItems.slice(0, 3).map((item) => ({ title: item.title, priority: item.priority })),
  };
}
