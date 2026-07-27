import type { AiProviderId } from '@ai-visibility/contracts';

export const AI_PROVIDER_CONNECTORS = Symbol('AI_PROVIDER_CONNECTORS');

export interface AiProviderConnectionResult {
  status: 'connected' | 'not-configured' | 'error';
  message?: string;
}

/**
 * One connector per external AI provider (`infrastructure/ai-provider/`) — the "provider
 * abstraction" the ticket asks for. Deliberately narrower than `application/ai-conversation`'s
 * `AiProvider` port (`CTO-068`): this one only tests connectivity/credentials, it does not
 * generate completions, and nothing in the product (Consultant Chat, Daily Briefing) depends on
 * it — those remain bound to the deterministic `StructuredFactAiProvider` (`CTO-069`). Adding a
 * seventh provider means one new class implementing this interface, registered in
 * `ai-provider.module.ts`; nothing else changes.
 */
export interface AiProviderConnector {
  readonly providerId: AiProviderId;
  testConnection(): Promise<AiProviderConnectionResult>;
}
