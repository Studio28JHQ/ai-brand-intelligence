import { Audit } from './audit.entity';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditRepository {
  create(projectId: string, url: string, cycleId: string, triggeredBy?: string | null): Promise<Audit>;
  markRunning(id: string, startedAt: Date): Promise<Audit>;
  markCompleted(id: string, completedAt: Date): Promise<Audit>;
  markFailed(id: string, failedAt: Date): Promise<Audit>;
  markCancelled(id: string, cancelledAt: Date): Promise<Audit>;
  findById(id: string): Promise<Audit | null>;
  findAll(): Promise<Audit[]>;
  findLatest(): Promise<Audit | null>;
  // Transactionally removes the Audit and every child row scoped to it (Findings, Signals,
  // Heuristic/Discovery/Crawl/Inventory results, Entities, Knowledge Graph nodes/relationships,
  // AI Visibility assessment, Workflow execution history) — see PrismaAuditRepository for the
  // exact FK-safe order. Does not touch ProjectBaselineHistory/OptimizationCampaign/Action, which
  // are immutable historical logs, not live references.
  delete(id: string): Promise<void>;
}
