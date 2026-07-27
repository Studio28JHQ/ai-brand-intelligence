import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { AiProviderId } from '@ai-visibility/contracts';
import { BaseAiProviderConnector } from './base-ai-provider.connector';
import type { AiProviderConnectionResult } from '../../application/ai-provider/ai-provider-connector';
import { fetchWithTimeout } from './fetch-with-timeout';

/** OpenRouter's `/models` list is public/unauthenticated, so it wouldn't actually validate a key — `/auth/key` returns the calling key's own metadata/limits, a genuine credential check. */
@Injectable()
export class OpenRouterConnector extends BaseAiProviderConnector {
  readonly providerId: AiProviderId = 'openrouter';

  protected apiKey(): string | undefined {
    return loadConfig().OPENROUTER_API_KEY;
  }

  protected async performTestConnection(apiKey: string): Promise<AiProviderConnectionResult> {
    const config = loadConfig();
    const response = await fetchWithTimeout(
      'https://openrouter.ai/api/v1/auth/key',
      { headers: { Authorization: `Bearer ${apiKey}` } },
      config.OPENROUTER_TIMEOUT_MS,
    );

    if (!response.ok) {
      const body = await response.text();
      return { status: 'error', message: `OpenRouter API rejected the request (HTTP ${response.status}): ${body}` };
    }

    return { status: 'connected' };
  }
}
