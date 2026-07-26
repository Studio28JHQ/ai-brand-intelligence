import type { AiContext } from '../ai-context/ai-context';
import type { ConversationIntentType } from './conversation-session';

export interface AiRequest {
  requestId: string;
  contextVersion: string;
  intentType: ConversationIntentType;
  question: string;
  context: AiContext;
}
