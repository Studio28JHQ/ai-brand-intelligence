import type { ConversationPolicy, PolicyDecision } from '../conversation-policy';
import type { ConversationIntentType, ConversationRequest } from '../conversation-session';

const SUPPORTED_INTENTS: ReadonlySet<ConversationIntentType> = new Set([
  'why',
  'what-should-i-do-first',
  'what-changed',
  'what-is-blocking-visibility',
  'general-question',
]);

export class SupportedIntentPolicy implements ConversationPolicy {
  readonly name = 'SupportedIntentPolicy';

  evaluate(request: ConversationRequest): PolicyDecision {
    if (!SUPPORTED_INTENTS.has(request.intent.type)) {
      return { allowed: false, reason: `Unsupported intent type: ${request.intent.type}` };
    }
    return { allowed: true };
  }
}
