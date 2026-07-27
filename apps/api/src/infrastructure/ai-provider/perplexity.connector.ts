import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { AiProviderId } from '@ai-visibility/contracts';
import { BaseAiProviderConnector } from './base-ai-provider.connector';
import type { AiProviderConnectionResult } from '../../application/ai-provider/ai-provider-connector';
import { fetchWithTimeout } from './fetch-with-timeout';

/**
 * Perplexity's API has no documented free/unauthenticated "list models" endpoint the way OpenAI/
 * Anthropic/Google do — `/chat/completions` is the only stable surface to validate a key against,
 * so this issues the smallest possible real request (`max_tokens: 1`) purely to confirm the key is
 * accepted. This is a deliberate, documented choice, not an oversight: it is the one connector in
 * this file where a Test Connection call can incur a (negligible) real cost.
 */
@Injectable()
export class PerplexityConnector extends BaseAiProviderConnector {
  readonly providerId: AiProviderId = 'perplexity';

  protected apiKey(): string | undefined {
    return loadConfig().PERPLEXITY_API_KEY;
  }

  protected async performTestConnection(apiKey: string): Promise<AiProviderConnectionResult> {
    const config = loadConfig();
    const response = await fetchWithTimeout(
      'https://api.perplexity.ai/chat/completions',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.PERPLEXITY_DEFAULT_MODEL,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
      },
      config.PERPLEXITY_TIMEOUT_MS,
    );

    if (!response.ok) {
      const body = await response.text();
      return { status: 'error', message: `Perplexity API rejected the request (HTTP ${response.status}): ${body}` };
    }

    return { status: 'connected' };
  }
}
