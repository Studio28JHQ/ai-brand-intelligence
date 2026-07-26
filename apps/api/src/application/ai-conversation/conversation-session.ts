export type ConversationIntentType =
  | 'why'
  | 'what-should-i-do-first'
  | 'what-changed'
  | 'what-is-blocking-visibility'
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
