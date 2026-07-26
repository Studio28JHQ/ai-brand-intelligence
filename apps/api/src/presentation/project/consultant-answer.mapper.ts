import type { ConsultantAnswer } from '@ai-visibility/contracts';
import type { ConversationResponse } from '../../application/ai-conversation/conversation-response';

export function toConsultantAnswer(question: string, conversationResponse: ConversationResponse): ConsultantAnswer {
  const { response } = conversationResponse;

  return {
    sessionId: conversationResponse.sessionId,
    requestId: conversationResponse.requestId,
    status: conversationResponse.status,
    question,
    answer: response?.content ?? null,
    facts: response?.facts ?? [],
    suggestedActions: response?.suggestedActions ?? [],
    confidence: response?.confidence ?? null,
    relatedFindings: response?.relatedFindings ?? [],
    relatedOptimizationItems: response?.relatedOptimizationItems ?? [],
    rejectionReason: conversationResponse.rejection?.reason ?? null,
  };
}
