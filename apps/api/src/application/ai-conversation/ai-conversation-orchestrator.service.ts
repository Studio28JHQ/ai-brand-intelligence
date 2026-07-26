import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { AiContextBuilderService } from '../ai-context/ai-context-builder.service';
import { AI_PROVIDER, AiProvider } from './ai-provider';
import { AiRequest } from './ai-request';
import { ConversationPolicy } from './conversation-policy';
import { ConversationRequest } from './conversation-session';
import { ConversationResponse } from './conversation-response';
import { RequireCompletedAuditPolicy } from './policies/require-completed-audit.policy';
import { SupportedIntentPolicy } from './policies/supported-intent.policy';

@Injectable()
export class AiConversationOrchestratorService {
  private readonly policies: ConversationPolicy[] = [new SupportedIntentPolicy(), new RequireCompletedAuditPolicy()];

  constructor(
    private readonly aiContextBuilderService: AiContextBuilderService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  async orchestrate(request: ConversationRequest): Promise<ConversationResponse> {
    const context = await this.aiContextBuilderService.build(request.session.projectId);

    for (const policy of this.policies) {
      const decision = policy.evaluate(request, context);
      if (!decision.allowed) {
        return {
          sessionId: request.session.sessionId,
          requestId: null,
          status: 'rejected',
          response: null,
          rejection: { policyName: policy.name, reason: decision.reason ?? 'Policy denied the request.' },
        };
      }
    }

    const aiRequest: AiRequest = {
      requestId: randomUUID(),
      contextVersion: context.contextVersion,
      intentType: request.intent.type,
      question: request.intent.question,
      context,
    };

    const aiResponse = await this.aiProvider.complete(aiRequest);

    return {
      sessionId: request.session.sessionId,
      requestId: aiRequest.requestId,
      status: aiResponse.status,
      response: aiResponse,
      rejection: null,
    };
  }
}
