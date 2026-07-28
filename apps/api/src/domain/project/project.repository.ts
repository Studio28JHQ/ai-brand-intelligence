import { Project } from './project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface ProjectRepository {
  create(clientId: string, name: string, canonicalWebsite: string): Promise<Project>;
  findByCanonicalWebsite(canonicalWebsite: string): Promise<Project | null>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  updateLastAudit(id: string, auditId: string | null): Promise<Project>;
  setBaseline(id: string, auditId: string): Promise<Project>;
  // Clears baselineAuditId/baselineSetAt back to null. Does not touch ProjectBaselineHistory — that
  // table is an immutable append-only log of every baseline that was ever set, not a live pointer.
  clearBaseline(id: string): Promise<Project>;
}
