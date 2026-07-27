import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { AiProviderId } from '@ai-visibility/contracts';
import { BaseAiProviderConnector } from './base-ai-provider.connector';
import type { AiProviderConnectionResult } from '../../application/ai-provider/ai-provider-connector';
import { fetchWithTimeout } from './fetch-with-timeout';

/** Lists models via Google's Generative Language API — the key is passed as a query param, per Google's own convention for this endpoint. */
@Injectable()
export class GoogleGeminiConnector extends BaseAiProviderConnector {
  readonly providerId: AiProviderId = 'google-gemini';

  protected apiKey(): string | undefined {
    return loadConfig().GOOGLE_API_KEY;
  }

  protected async performTestConnection(apiKey: string): Promise<AiProviderConnectionResult> {
    const config = loadConfig();
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      {},
      config.GOOGLE_TIMEOUT_MS,
    );

    if (!response.ok) {
      const body = await response.text();
      return { status: 'error', message: `Google Gemini API rejected the request (HTTP ${response.status}): ${body}` };
    }

    return { status: 'connected' };
  }
}
