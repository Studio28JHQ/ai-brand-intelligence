import { logger } from '@ai-visibility/shared';
import type { AiProviderId } from '@ai-visibility/contracts';
import type { AiProviderConnectionResult, AiProviderConnector } from '../../application/ai-provider/ai-provider-connector';

/**
 * Shared guard: "the actual HTTP call for Test Connection must execute ONLY when a valid API key
 * is configured" (`F10-S01`). Every concrete connector extends this instead of re-implementing the
 * check, so the guard can never be skipped by a future provider's own implementation mistake.
 */
export abstract class BaseAiProviderConnector implements AiProviderConnector {
  abstract readonly providerId: AiProviderId;

  protected abstract apiKey(): string | undefined;
  protected abstract performTestConnection(apiKey: string): Promise<AiProviderConnectionResult>;

  async testConnection(): Promise<AiProviderConnectionResult> {
    const apiKey = this.apiKey();
    if (!apiKey || apiKey.trim().length === 0) {
      return { status: 'not-configured' };
    }

    try {
      return await this.performTestConnection(apiKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`AI provider Test Connection failed`, { providerId: this.providerId, reason: message });
      return { status: 'error', message };
    }
  }
}
