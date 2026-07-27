export type AiProviderId = 'openai' | 'anthropic' | 'google-gemini' | 'xai' | 'openrouter' | 'perplexity';

export type AiProviderConnectionStatus = 'connected' | 'not-configured' | 'error' | 'untested';

export interface AiProviderSettings {
  providerId: AiProviderId;
  label: string;
  enabled: boolean;
  hasApiKey: boolean;
  defaultModel: string;
  timeoutMs: number;
  maxTokens: number;
  connectionStatus: AiProviderConnectionStatus;
  lastSuccessfulTestAt: string | null;
}

export interface AiProviderTestConnectionResult {
  providerId: AiProviderId;
  status: AiProviderConnectionStatus;
  message?: string;
  testedAt: string;
}
