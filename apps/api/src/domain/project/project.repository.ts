import { Project } from './project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface ProjectRepository {
  create(name: string, canonicalWebsite: string): Promise<Project>;
  findByCanonicalWebsite(canonicalWebsite: string): Promise<Project | null>;
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  updateLastAudit(id: string, auditId: string): Promise<Project>;
}
