import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { AiProviderSettings } from '@ai-visibility/contracts';
import { buildAiProviderSettings } from './build-ai-provider-settings';
import { AiProviderStatusStore } from './ai-provider-status.store';

/** The "Platform Settings data model" the ticket asks for — merges the static `.env`-derived shape with whatever Test Connection has (or hasn't) recorded this process's lifetime. */
@Injectable()
export class AiProviderSettingsService {
  constructor(private readonly statusStore: AiProviderStatusStore) {}

  list(): AiProviderSettings[] {
    const config = loadConfig();
    return buildAiProviderSettings(config).map((settings) => {
      const recorded = this.statusStore.get(settings.providerId);
      if (!recorded) {
        return settings;
      }
      return { ...settings, connectionStatus: recorded.status, lastSuccessfulTestAt: recorded.lastSuccessfulTestAt };
    });
  }
}
