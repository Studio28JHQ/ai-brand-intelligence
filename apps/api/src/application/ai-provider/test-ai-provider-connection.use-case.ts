import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AiProviderId, AiProviderTestConnectionResult } from '@ai-visibility/contracts';
import { AI_PROVIDER_CONNECTORS, AiProviderConnector } from './ai-provider-connector';
import { AiProviderSettingsService } from './ai-provider-settings.service';
import { AiProviderStatusStore } from './ai-provider-status.store';

/**
 * The "Test Connection" interface the ticket asks for. The real HTTP call only happens if
 * `hasApiKey` is true — checked here, before the connector is even invoked, on top of each
 * connector's own identical guard (defense in depth, not redundancy for its own sake: this use
 * case is the one place that can never accidentally skip the check no matter what a future
 * connector implementation does).
 */
@Injectable()
export class TestAiProviderConnectionUseCase {
  constructor(
    @Inject(AI_PROVIDER_CONNECTORS) private readonly connectors: AiProviderConnector[],
    private readonly settingsService: AiProviderSettingsService,
    private readonly statusStore: AiProviderStatusStore,
  ) {}

  async execute(providerId: AiProviderId): Promise<AiProviderTestConnectionResult> {
    const settings = this.settingsService.list().find((entry) => entry.providerId === providerId);
    if (!settings) {
      throw new NotFoundException(`Unknown AI provider: ${providerId}`);
    }

    if (!settings.hasApiKey) {
      this.statusStore.record(providerId, 'not-configured');
      return { providerId, status: 'not-configured', testedAt: new Date().toISOString() };
    }

    const connector = this.connectors.find((entry) => entry.providerId === providerId);
    if (!connector) {
      throw new NotFoundException(`No connector registered for AI provider: ${providerId}`);
    }

    const result = await connector.testConnection();
    this.statusStore.record(providerId, result.status);
    return { providerId, status: result.status, message: result.message, testedAt: new Date().toISOString() };
  }
}
