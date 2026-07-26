export interface ProjectMetadata {
  id: string;
  clientId: string;
  name: string;
  canonicalWebsite: string;
  createdAt: string;
  lastAuditId: string | null;
  baselineAuditId: string | null;
  baselineSetAt: string | null;
}
