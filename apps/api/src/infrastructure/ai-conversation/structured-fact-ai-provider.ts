import { Injectable } from '@nestjs/common';
import type { AiProvider } from '../../application/ai-conversation/ai-provider';
import type { AiRequest } from '../../application/ai-conversation/ai-request';
import type { AiResponse } from '../../application/ai-conversation/ai-response';
import { buildAnswer } from '../../application/ai-conversation/answers/build-answer';

@Injectable()
export class StructuredFactAiProvider implements AiProvider {
  readonly providerId = 'structured-fact-provider';

  async complete(request: AiRequest): Promise<AiResponse> {
    const answer = buildAnswer(request.intentType, request.context);

    return {
      requestId: request.requestId,
      status: 'completed',
      content: answer.interpretation,
      providerId: this.providerId,
      facts: answer.facts,
      suggestedActions: answer.suggestedActions,
      confidence: answer.confidence,
      relatedFindings: answer.relatedFindings,
      relatedOptimizationItems: answer.relatedOptimizationItems,
    };
  }
}
