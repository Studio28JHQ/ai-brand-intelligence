import { AuditType } from './audit-type';

export const FULL_AUDIT_TYPE: AuditType = {
  id: 'full-audit',
  productCapabilityIds: [
    'site-discovery',
    'page-crawling',
    'content-inventory',
    'rule-analysis',
    'entity-extraction',
    'knowledge-graph',
    'ai-visibility-assessment',
  ],
};
