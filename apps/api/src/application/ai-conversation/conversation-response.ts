import type { AiResponse } from './ai-response';

export type ConversationResponseStatus = 'completed' | 'unavailable' | 'rejected';

export interface PolicyRejection {
  policyName: string;
  reason: string;
}

export interface ConversationResponse {
  sessionId: string;
  requestId: string | null;
  status: ConversationResponseStatus;
  response: AiResponse | null;
  rejection: PolicyRejection | null;
}
