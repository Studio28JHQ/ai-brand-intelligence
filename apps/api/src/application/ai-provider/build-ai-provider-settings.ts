import type { PlatformConfig } from '@ai-visibility/config';
import type { AiProviderId, AiProviderSettings } from '@ai-visibility/contracts';

interface ProviderDefinition {
  providerId: AiProviderId;
  label: string;
  apiKey: string | undefined;
  enabled: boolean;
  defaultModel: string;
  timeoutMs: number;
  maxTokens: number;
}

function toSettings({ providerId, label, apiKey, enabled, defaultModel, timeoutMs, maxTokens }: ProviderDefinition): AiProviderSettings {
  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);
  return {
    providerId,
    label,
    enabled: enabled && hasApiKey,
    hasApiKey,
    defaultModel,
    timeoutMs,
    maxTokens,
    connectionStatus: hasApiKey ? 'untested' : 'not-configured',
    lastSuccessfulTestAt: null,
  };
}

/**
 * The single source of truth for "what does `.env` say about each AI provider" — read by both
 * `main.ts`'s startup summary log and `AiProviderSettingsService` (the "Platform Settings data
 * model" the ticket asks for), so the two can never drift. Pure and DI-free: it only reads the
 * already-loaded `PlatformConfig`, never `process.env` directly, and never makes a network call —
 * `connectionStatus` here is always `'not-configured'` or `'untested'`, never `'connected'`/`'error'`;
 * only an actual Test Connection call (`TestAiProviderConnectionUseCase`) can produce those.
 */
export function buildAiProviderSettings(config: PlatformConfig): AiProviderSettings[] {
  const definitions: ProviderDefinition[] = [
    {
      providerId: 'openai',
      label: 'OpenAI',
      apiKey: config.OPENAI_API_KEY,
      enabled: config.OPENAI_ENABLED,
      defaultModel: config.OPENAI_DEFAULT_MODEL,
      timeoutMs: config.OPENAI_TIMEOUT_MS,
      maxTokens: config.OPENAI_MAX_TOKENS,
    },
    {
      providerId: 'anthropic',
      label: 'Anthropic',
      apiKey: config.ANTHROPIC_API_KEY,
      enabled: config.ANTHROPIC_ENABLED,
      defaultModel: config.ANTHROPIC_DEFAULT_MODEL,
      timeoutMs: config.ANTHROPIC_TIMEOUT_MS,
      maxTokens: config.ANTHROPIC_MAX_TOKENS,
    },
    {
      providerId: 'google-gemini',
      label: 'Google Gemini',
      apiKey: config.GOOGLE_API_KEY,
      enabled: config.GOOGLE_ENABLED,
      defaultModel: config.GOOGLE_DEFAULT_MODEL,
      timeoutMs: config.GOOGLE_TIMEOUT_MS,
      maxTokens: config.GOOGLE_MAX_TOKENS,
    },
    {
      providerId: 'xai',
      label: 'xAI',
      apiKey: config.XAI_API_KEY,
      enabled: config.XAI_ENABLED,
      defaultModel: config.XAI_DEFAULT_MODEL,
      timeoutMs: config.XAI_TIMEOUT_MS,
      maxTokens: config.XAI_MAX_TOKENS,
    },
    {
      providerId: 'openrouter',
      label: 'OpenRouter',
      apiKey: config.OPENROUTER_API_KEY,
      enabled: config.OPENROUTER_ENABLED,
      defaultModel: config.OPENROUTER_DEFAULT_MODEL,
      timeoutMs: config.OPENROUTER_TIMEOUT_MS,
      maxTokens: config.OPENROUTER_MAX_TOKENS,
    },
    {
      providerId: 'perplexity',
      label: 'Perplexity',
      apiKey: config.PERPLEXITY_API_KEY,
      enabled: config.PERPLEXITY_ENABLED,
      defaultModel: config.PERPLEXITY_DEFAULT_MODEL,
      timeoutMs: config.PERPLEXITY_TIMEOUT_MS,
      maxTokens: config.PERPLEXITY_MAX_TOKENS,
    },
  ];

  return definitions.map(toSettings);
}
