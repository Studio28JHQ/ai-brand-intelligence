import type { AiContext } from '../../ai-context/ai-context';
import type { ConversationPolicy, PolicyDecision } from '../conversation-policy';
import type { ConversationRequest } from '../conversation-session';

export class RequireCompletedAuditPolicy implements ConversationPolicy {
  readonly name = 'RequireCompletedAuditPolicy';

  evaluate(_request: ConversationRequest, context: AiContext): PolicyDecision {
    if (!context.latestAudit) {
      return { allowed: false, reason: 'Project has no completed Audit yet.' };
    }
    return { allowed: true };
  }
}
