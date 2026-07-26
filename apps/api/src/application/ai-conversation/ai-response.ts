export type AiResponseStatus = 'completed' | 'unavailable';

export interface AiResponse {
  requestId: string;
  status: AiResponseStatus;
  content: string | null;
  providerId: string;
}
