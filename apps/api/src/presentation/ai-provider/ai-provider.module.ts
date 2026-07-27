import { Module } from '@nestjs/common';
import { AI_PROVIDER_CONNECTORS } from '../../application/ai-provider/ai-provider-connector';
import { AiProviderSettingsService } from '../../application/ai-provider/ai-provider-settings.service';
import { AiProviderStatusStore } from '../../application/ai-provider/ai-provider-status.store';
import { TestAiProviderConnectionUseCase } from '../../application/ai-provider/test-ai-provider-connection.use-case';
import { OpenAiConnector } from '../../infrastructure/ai-provider/openai.connector';
import { AnthropicConnector } from '../../infrastructure/ai-provider/anthropic.connector';
import { GoogleGeminiConnector } from '../../infrastructure/ai-provider/google-gemini.connector';
import { XaiConnector } from '../../infrastructure/ai-provider/xai.connector';
import { OpenRouterConnector } from '../../infrastructure/ai-provider/openrouter.connector';
import { PerplexityConnector } from '../../infrastructure/ai-provider/perplexity.connector';
import { AiProviderController } from './ai-provider.controller';

@Module({
  controllers: [AiProviderController],
  providers: [
    AiProviderSettingsService,
    AiProviderStatusStore,
    TestAiProviderConnectionUseCase,
    OpenAiConnector,
    AnthropicConnector,
    GoogleGeminiConnector,
    XaiConnector,
    OpenRouterConnector,
    PerplexityConnector,
    {
      provide: AI_PROVIDER_CONNECTORS,
      useFactory: (
        openai: OpenAiConnector,
        anthropic: AnthropicConnector,
        googleGemini: GoogleGeminiConnector,
        xai: XaiConnector,
        openRouter: OpenRouterConnector,
        perplexity: PerplexityConnector,
      ) => [openai, anthropic, googleGemini, xai, openRouter, perplexity],
      inject: [OpenAiConnector, AnthropicConnector, GoogleGeminiConnector, XaiConnector, OpenRouterConnector, PerplexityConnector],
    },
  ],
})
export class AiProviderModule {}
