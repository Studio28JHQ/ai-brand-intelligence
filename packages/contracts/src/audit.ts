export type AuditStatus = 'pending';

export interface CreateAuditRequest {
  url: string;
}

export interface CreateAuditResponse {
  id: string;
  status: AuditStatus;
}
