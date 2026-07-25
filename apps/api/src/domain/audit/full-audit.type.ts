import { AuditType } from './audit-type';

export const FULL_AUDIT_TYPE: AuditType = {
  id: 'full-audit',
  capabilityIds: ['discovery', 'crawl', 'inventory', 'analysis', 'entity', 'knowledgeGraph', 'aiVisibility'],
};
