'use server';

import { loadConfig } from '@ai-visibility/config';
import type {
  AuditAnalysisView,
  AuditComparisonResult,
  AuditHistoryEntry,
  AuditMetadata,
  AuditStatus,
  BriefingModel,
  CampaignMetadata,
  ClientMetadata,
  ConsultantAnswer,
  ConsultantIntentType,
  CreateAuditResponse,
  CycleStatus,
  ExecutiveClientReport,
  ExecutiveDashboard,
  Finding,
  ImpactAssessment,
  OptimizationCycleMetadata,
  OptimizationItem,
  PageAuditHistoryEntry,
  PageComparisonResult,
  ProjectMetadata,
  ProjectPage,
  VisibilityStatus,
  WorkflowExecutionRecord,
} from '@ai-visibility/contracts';

// The Workflow Runtime now runs in the background rather than blocking POST /audits
// (F10-S04B, see docs/04_PROJECT/DECISION_LOG.md#cto-104), so this shape — sourced from
// GET /audits/:id plus GET /audits/:id/analysis once the Audit finishes — is what `createAudit`
// below can honestly reconstruct, rather than the old all-optional CreateAuditResponse (which
// described a single synchronous response that no longer exists).
export interface AuditCompletionResult {
  id: string;
  status: AuditStatus;
  executionHistory: WorkflowExecutionRecord[];
  findings: Finding[];
  optimizationPlan: OptimizationItem[];
  aiVisibilityStatus: VisibilityStatus | null;
}

export interface CreateAuditState {
  result?: AuditCompletionResult;
  error?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listAudits(): Promise<AuditMetadata[]> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/audits`, { cache: 'no-store' });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as AuditMetadata[];
  } catch {
    return [];
  }
}

export async function listAuditHistory(): Promise<AuditHistoryEntry[]> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/audits/history`, { cache: 'no-store' });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as AuditHistoryEntry[];
  } catch {
    return [];
  }
}

export interface DeleteAuditResult {
  success: boolean;
  requiresBaselineConfirmation?: boolean;
  error?: string;
}

export async function deleteAudit(auditId: string, confirmBaseline = false): Promise<DeleteAuditResult> {
  const config = loadConfig();

  try {
    const response = await fetch(
      `${config.API_URL}/audits/${auditId}${confirmBaseline ? '?confirmBaseline=true' : ''}`,
      { method: 'DELETE' },
    );

    if (response.ok) {
      return { success: true };
    }

    const body = await response.json().catch(() => null);
    const message: string | undefined = body?.error?.message;
    // The API returns the same 409 shape whether this Audit is merely in-progress or is the
    // Project's Baseline — distinguish by message content so the UI can offer the stronger
    // confirmation only when it's genuinely the Baseline case, never by guessing.
    const requiresBaselineConfirmation = response.status === 409 && !confirmBaseline && !!message?.includes('Baseline');
    return { success: false, requiresBaselineConfirmation, error: message ?? 'Could not delete the Audit.' };
  } catch {
    return { success: false, error: 'Could not reach the API.' };
  }
}

export async function listClients(): Promise<ClientMetadata[]> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/clients`, { cache: 'no-store' });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ClientMetadata[];
  } catch {
    return [];
  }
}

export async function createClient(
  name: string,
  industry: string,
  primaryDomain: string,
): Promise<{ error?: string }> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, industry, primaryDomain }),
    });

    if (!response.ok) {
      const body = await response.json();
      return { error: body?.error?.message ?? 'Failed to create client' };
    }

    return {};
  } catch {
    return { error: 'Failed to reach the backend' };
  }
}

export async function listProjects(): Promise<ProjectMetadata[]> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/projects`, { cache: 'no-store' });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ProjectMetadata[];
  } catch {
    return [];
  }
}

export async function setProjectBaseline(projectId: string, auditId: string): Promise<boolean> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/projects/${projectId}/baseline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function getDashboard(projectId: string): Promise<ExecutiveDashboard | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/projects/${projectId}/dashboard`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ExecutiveDashboard;
  } catch {
    return null;
  }
}

export async function getProjectPages(projectId: string): Promise<ProjectPage[]> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/projects/${projectId}/pages`, { cache: 'no-store' });

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as ProjectPage[];
  } catch {
    return [];
  }
}

export async function createCampaign(projectId: string): Promise<{ error?: string }> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/projects/${projectId}/campaigns`, { method: 'POST' });

    if (!response.ok) {
      const body = await response.json();
      return { error: body?.error?.message ?? 'Failed to create campaign' };
    }

    return {};
  } catch {
    return { error: 'Failed to reach the backend' };
  }
}

export async function getLatestCampaign(projectId: string): Promise<CampaignMetadata | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/projects/${projectId}/campaigns/latest`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as CampaignMetadata;
  } catch {
    return null;
  }
}

export async function setCampaignStatus(
  campaignId: string,
  status: 'active' | 'completed' | 'archived',
): Promise<boolean> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/campaigns/${campaignId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function setActionStatus(
  campaignId: string,
  actionId: string,
  status: 'in-progress' | 'completed' | 'verified',
): Promise<boolean> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/campaigns/${campaignId}/actions/${actionId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function getImpactAssessment(campaignId: string): Promise<ImpactAssessment | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/campaigns/${campaignId}/impact-assessment`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ImpactAssessment;
  } catch {
    return null;
  }
}

export async function compareAudits(
  baselineAuditId: string,
  targetAuditId: string,
): Promise<AuditComparisonResult | null> {
  const config = loadConfig();

  try {
    const response = await fetch(
      `${config.API_URL}/audits/compare?baselineAuditId=${baselineAuditId}&targetAuditId=${targetAuditId}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuditComparisonResult;
  } catch {
    return null;
  }
}

export async function getPageAuditHistory(projectId: string, url: string): Promise<PageAuditHistoryEntry[]> {
  const config = loadConfig();

  try {
    const response = await fetch(
      `${config.API_URL}/projects/${projectId}/pages/audits?url=${encodeURIComponent(url)}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return [];
    }

    return (await response.json()) as PageAuditHistoryEntry[];
  } catch {
    return [];
  }
}

export async function comparePages(baselineAuditId: string, targetAuditId: string): Promise<PageComparisonResult | null> {
  const config = loadConfig();

  try {
    const response = await fetch(
      `${config.API_URL}/audits/compare/page?baselineAuditId=${baselineAuditId}&targetAuditId=${targetAuditId}`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PageComparisonResult;
  } catch {
    return null;
  }
}

export async function getAudit(id: string): Promise<AuditMetadata | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/audits/${id}`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuditMetadata;
  } catch {
    return null;
  }
}

const AUDIT_POLL_INTERVAL_MS = 1500;
const AUDIT_MAX_WAIT_MS = 5 * 60 * 1000;

export async function createAudit(
  _prevState: CreateAuditState,
  formData: FormData,
): Promise<CreateAuditState> {
  const url = formData.get('url');
  const clientId = formData.get('clientId');
  const source = formData.get('source');

  if (typeof url !== 'string' || url.trim().length === 0) {
    return { error: 'URL is required' };
  }

  const config = loadConfig();

  let auditId: string;
  try {
    const response = await fetch(`${config.API_URL}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        ...(typeof clientId === 'string' && clientId.trim().length > 0 ? { clientId } : {}),
        ...(typeof source === 'string' && source.trim().length > 0 ? { triggeredBy: source } : {}),
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      return { error: body?.error?.message ?? 'Failed to create audit' };
    }

    auditId = (body as CreateAuditResponse).id;
  } catch {
    return { error: 'Failed to reach the backend' };
  }

  // The Workflow Runtime now runs in the background (F10-S04B) instead of blocking the POST above,
  // so this form waits here for it to reach a terminal state — preserving its original "submit and
  // see the full result inline" UX without any change to this form's own markup/behavior.
  const deadline = Date.now() + AUDIT_MAX_WAIT_MS;
  while (Date.now() < deadline) {
    const audit = await getAudit(auditId);
    if (!audit) {
      return { error: 'Audit not found after creation.' };
    }

    if (audit.status === 'completed') {
      const analysis = await getAuditAnalysis(auditId);
      return {
        result: {
          id: audit.id,
          status: audit.status,
          executionHistory: audit.executionHistory,
          findings: analysis?.findings ?? [],
          optimizationPlan: analysis?.optimizationPlan ?? [],
          aiVisibilityStatus: audit.aiVisibilityStatus,
        },
      };
    }

    if (audit.status === 'failed') {
      return { error: 'The Audit failed to complete. Check Audit History for details.' };
    }

    await sleep(AUDIT_POLL_INTERVAL_MS);
  }

  return { error: 'The Audit is taking longer than expected. Check Audit History for its current status.' };
}

export interface RunAuditResult {
  auditId?: string;
  error?: string;
}

// Real POST /audits under the hood, returning as soon as the Audit is queued (F10-S04B — the
// Workflow Runtime itself now runs in the background). Kept separate from `createAudit` because
// callers of this one need the new Audit's id directly (to navigate to it), not the
// `useActionState` form-state shape `createAudit` returns. `source` identifies which real UI
// surface this modal was opened from (see AuditRequest.triggeredBy) — not a user identity.
export async function runNewAudit(url: string, source: string): Promise<RunAuditResult> {
  if (url.trim().length === 0) {
    return { error: 'URL is required' };
  }

  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, triggeredBy: source }),
    });

    const body = await response.json();

    if (!response.ok) {
      return { error: body?.error?.message ?? 'Could not start the Audit.' };
    }

    return { auditId: (body as CreateAuditResponse).id };
  } catch {
    return { error: 'Could not reach the API.' };
  }
}

export async function getAuditAnalysis(auditId: string): Promise<AuditAnalysisView | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/audits/${auditId}/analysis`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuditAnalysisView;
  } catch {
    return null;
  }
}

export async function getCurrentCycle(projectId: string): Promise<OptimizationCycleMetadata | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/projects/${projectId}/cycles/current`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as OptimizationCycleMetadata;
  } catch {
    return null;
  }
}

export async function transitionCycleStatus(cycleId: string, status: CycleStatus): Promise<boolean> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/cycles/${cycleId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function getExecutiveClientReport(cycleId: string): Promise<ExecutiveClientReport | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/cycles/${cycleId}/report`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ExecutiveClientReport;
  } catch {
    return null;
  }
}

export async function getDailyBriefing(): Promise<BriefingModel | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/briefing/daily`, { cache: 'no-store' });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as BriefingModel;
  } catch {
    return null;
  }
}

export async function askConsultant(
  projectId: string,
  intentType: ConsultantIntentType,
  question: string,
): Promise<ConsultantAnswer | null> {
  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/projects/${projectId}/consultant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intentType, question }),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ConsultantAnswer;
  } catch {
    return null;
  }
}
