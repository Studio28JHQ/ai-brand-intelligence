import { Audit } from './audit.entity';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditRepository {
  create(projectId: string, url: string): Promise<Audit>;
  markRunning(id: string, startedAt: Date): Promise<Audit>;
  markCompleted(id: string, completedAt: Date): Promise<Audit>;
  markFailed(id: string, failedAt: Date): Promise<Audit>;
  markCancelled(id: string, cancelledAt: Date): Promise<Audit>;
  findById(id: string): Promise<Audit | null>;
  findAll(): Promise<Audit[]>;
  findLatest(): Promise<Audit | null>;
}
