import { Audit } from './audit.entity';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditRepository {
  create(url: string): Promise<Audit>;
}
