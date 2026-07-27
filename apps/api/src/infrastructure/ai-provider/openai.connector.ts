import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { AiProviderId } from '@ai-visibility/contracts';
import { BaseAiProviderConnector } from './base-ai-provider.connector';
import type { AiProviderConnectionResult } from '../../application/ai-provider/ai-provider-connector';
import { fetchWithTimeout } from './fetch-with-timeout';

/** Lists models — the cheapest authenticated call OpenAI's API exposes, ideal as a pure connectivity+credential check. */
@Injectable()
export class OpenAiConnector extends BaseAiProviderConnector {
  readonly providerId: AiProviderId = 'openai';

  protected apiKey(): string | undefined {
    return loadConfig().OPENAI_API_KEY;
  }

  protected async performTestConnection(apiKey: string): Promise<AiProviderConnectionResult> {
    const config = loadConfig();
    const response = await fetchWithTimeout(
      'https://api.openai.com/v1/models',
      { headers: { Authorization: `Bearer ${apiKey}` } },
      config.OPENAI_TIMEOUT_MS,
    );

    if (!response.ok) {
      const body = await response.text();
      return { status: 'error', message: `OpenAI API rejected the request (HTTP ${response.status}): ${body}` };
    }

    return { status: 'connected' };
  }
}
