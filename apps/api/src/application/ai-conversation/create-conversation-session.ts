import { randomUUID } from 'node:crypto';
import type { ConversationSession } from './conversation-session';

export function createConversationSession(projectId: string): ConversationSession {
  return { sessionId: randomUUID(), projectId, startedAt: new Date().toISOString() };
}
