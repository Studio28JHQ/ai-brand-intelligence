import type { AiContext } from '../ai-context/ai-context';
import type { ConversationRequest } from './conversation-session';

export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
}

export interface ConversationPolicy {
  readonly name: string;
  evaluate(request: ConversationRequest, context: AiContext): PolicyDecision;
}
