import { Audit } from '../../domain/audit/audit.entity';
import { DiscoveryResult } from '../../domain/audit/discovery.port';

export interface CreateAuditResult {
  audit: Audit;
  discovery: DiscoveryResult;
}
