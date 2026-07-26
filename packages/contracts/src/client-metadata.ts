export type ClientStatus = 'active' | 'inactive';

export interface ClientMetadata {
  id: string;
  name: string;
  industry: string;
  primaryDomain: string;
  status: ClientStatus;
  createdAt: string;
}
