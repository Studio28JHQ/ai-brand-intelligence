export type ConversationIntentType =
  | 'explain-findings'
  | 'explain-optimization-plan'
  | 'explain-campaign-impact'
  | 'general-question';

export interface ConversationSession {
  sessionId: string;
  projectId: string;
  startedAt: string;
}

export interface UserIntent {
  type: ConversationIntentType;
  question: string;
}

export interface ConversationRequest {
  session: ConversationSession;
  intent: UserIntent;
}
