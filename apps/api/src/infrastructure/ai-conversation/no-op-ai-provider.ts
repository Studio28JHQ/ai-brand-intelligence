import { Injectable } from '@nestjs/common';
import type { AiProvider } from '../../application/ai-conversation/ai-provider';
import type { AiRequest } from '../../application/ai-conversation/ai-request';
import type { AiResponse } from '../../application/ai-conversation/ai-response';

@Injectable()
export class NoOpAiProvider implements AiProvider {
  readonly providerId = 'none';

  async complete(request: AiRequest): Promise<AiResponse> {
    return {
      requestId: request.requestId,
      status: 'unavailable',
      content: null,
      providerId: this.providerId,
      facts: [],
      suggestedActions: [],
      confidence: null,
      relatedFindings: [],
      relatedOptimizationItems: [],
    };
  }
}
