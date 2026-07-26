'use server';

import { loadConfig } from '@ai-visibility/config';
import type {
  AuditComparisonResult,
  AuditMetadata,
  CampaignMetadata,
  ClientMetadata,
  CreateAuditResponse,
  ExecutiveDashboard,
  ImpactAssessment,
  ProjectMetadata,
} from '@ai-visibility/contracts';

export interface CreateAuditState {
  result?: CreateAuditResponse;
  error?: string;
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

export async function createAudit(
  _prevState: CreateAuditState,
  formData: FormData,
): Promise<CreateAuditState> {
  const url = formData.get('url');
  const clientId = formData.get('clientId');

  if (typeof url !== 'string' || url.trim().length === 0) {
    return { error: 'URL is required' };
  }

  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        ...(typeof clientId === 'string' && clientId.trim().length > 0 ? { clientId } : {}),
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      return { error: body?.error?.message ?? 'Failed to create audit' };
    }

    return { result: body as CreateAuditResponse };
  } catch {
    return { error: 'Failed to reach the backend' };
  }
}
