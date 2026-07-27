import { BadRequestException, Controller, Get, Param, Post } from '@nestjs/common';
import type { AiProviderId, AiProviderSettings, AiProviderTestConnectionResult } from '@ai-visibility/contracts';
import { AiProviderSettingsService } from '../../application/ai-provider/ai-provider-settings.service';
import { TestAiProviderConnectionUseCase } from '../../application/ai-provider/test-ai-provider-connection.use-case';

const KNOWN_PROVIDER_IDS: AiProviderId[] = ['openai', 'anthropic', 'google-gemini', 'xai', 'openrouter', 'perplexity'];

function assertKnownProviderId(providerId: string): asserts providerId is AiProviderId {
  if (!KNOWN_PROVIDER_IDS.includes(providerId as AiProviderId)) {
    throw new BadRequestException(`Unknown AI provider: ${providerId}. Known providers: ${KNOWN_PROVIDER_IDS.join(', ')}.`);
  }
}

/** Platform Settings surface for AI providers (`F10-S01`) — read-only configuration + on-demand Test Connection, for a future settings UI. Never returns raw API key values, only `hasApiKey`. */
@Controller('platform/ai-providers')
export class AiProviderController {
  constructor(
    private readonly settingsService: AiProviderSettingsService,
    private readonly testConnectionUseCase: TestAiProviderConnectionUseCase,
  ) {}

  @Get()
  list(): AiProviderSettings[] {
    return this.settingsService.list();
  }

  @Post(':providerId/test-connection')
  async testConnection(@Param('providerId') providerId: string): Promise<AiProviderTestConnectionResult> {
    assertKnownProviderId(providerId);
    return this.testConnectionUseCase.execute(providerId);
  }
}
