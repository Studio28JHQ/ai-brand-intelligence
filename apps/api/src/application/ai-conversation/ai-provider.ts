import type { AiRequest } from './ai-request';
import type { AiResponse } from './ai-response';

export const AI_PROVIDER = Symbol('AI_PROVIDER');

export interface AiProvider {
  readonly providerId: string;
  complete(request: AiRequest): Promise<AiResponse>;
}
