import { Audit } from './audit.entity';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditRepository {
  create(url: string): Promise<Audit>;
  markRunning(id: string, startedAt: Date): Promise<Audit>;
  markCompleted(id: string, completedAt: Date): Promise<Audit>;
}
