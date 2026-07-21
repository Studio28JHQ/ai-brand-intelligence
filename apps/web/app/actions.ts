'use server';

import { loadConfig } from '@ai-visibility/config';
import type { CreateAuditResponse } from '@ai-visibility/contracts';

export interface CreateAuditState {
  result?: CreateAuditResponse;
  error?: string;
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
