import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { AiProviderId } from '@ai-visibility/contracts';
import { BaseAiProviderConnector } from './base-ai-provider.connector';
import type { AiProviderConnectionResult } from '../../application/ai-provider/ai-provider-connector';
import { fetchWithTimeout } from './fetch-with-timeout';

/** xAI's API surface is OpenAI-compatible — the same "list models" pattern applies. */
@Injectable()
export class XaiConnector extends BaseAiProviderConnector {
  readonly providerId: AiProviderId = 'xai';

  protected apiKey(): string | undefined {
    return loadConfig().XAI_API_KEY;
  }

  protected async performTestConnection(apiKey: string): Promise<AiProviderConnectionResult> {
    const config = loadConfig();
    const response = await fetchWithTimeout(
      'https://api.x.ai/v1/models',
      { headers: { Authorization: `Bearer ${apiKey}` } },
      config.XAI_TIMEOUT_MS,
    );

    if (!response.ok) {
      const body = await response.text();
      return { status: 'error', message: `xAI API rejected the request (HTTP ${response.status}): ${body}` };
    }

    return { status: 'connected' };
  }
}
