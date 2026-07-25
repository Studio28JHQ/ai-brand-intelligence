'use server';

import { loadConfig } from '@ai-visibility/config';
import type { AuditComparisonResult, AuditMetadata, CreateAuditResponse, ProjectMetadata } from '@ai-visibility/contracts';

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

  if (typeof url !== 'string' || url.trim().length === 0) {
    return { error: 'URL is required' };
  }

  const config = loadConfig();

  try {
    const response = await fetch(`${config.API_URL}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
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
