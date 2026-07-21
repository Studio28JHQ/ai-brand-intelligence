export type AuditStatus = 'pending' | 'running' | 'completed';

export interface CreateAuditRequest {
  url: string;
}

export interface CreateAuditResponse {
  id: string;
  status: AuditStatus;
}
