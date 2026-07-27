import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { AiProviderId } from '@ai-visibility/contracts';
import { BaseAiProviderConnector } from './base-ai-provider.connector';
import type { AiProviderConnectionResult } from '../../application/ai-provider/ai-provider-connector';
import { fetchWithTimeout } from './fetch-with-timeout';

const ANTHROPIC_API_VERSION = '2023-06-01';

/** Lists models via Anthropic's Messages API surface — validates the key without generating any completion. */
@Injectable()
export class AnthropicConnector extends BaseAiProviderConnector {
  readonly providerId: AiProviderId = 'anthropic';

  protected apiKey(): string | undefined {
    return loadConfig().ANTHROPIC_API_KEY;
  }

  protected async performTestConnection(apiKey: string): Promise<AiProviderConnectionResult> {
    const config = loadConfig();
    const response = await fetchWithTimeout(
      'https://api.anthropic.com/v1/models',
      { headers: { 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_API_VERSION } },
      config.ANTHROPIC_TIMEOUT_MS,
    );

    if (!response.ok) {
      const body = await response.text();
      return { status: 'error', message: `Anthropic API rejected the request (HTTP ${response.status}): ${body}` };
    }

    return { status: 'connected' };
  }
}
