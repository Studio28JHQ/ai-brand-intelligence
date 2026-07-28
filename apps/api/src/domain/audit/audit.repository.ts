import { Audit, AuditStatus } from './audit.entity';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface AuditRepository {
  // `initialStatus` ('pending' by default) lets CreateAuditUseCase persist a request as 'queued'
  // when another Audit is already in flight for the Project (F10-S04D). If a 'pending' insert
  // collides with the partial unique index guarding at-most-one-in-flight-per-Project, the
  // implementation falls back to inserting as 'queued' instead of failing outright.
  create(
    projectId: string,
    url: string,
    cycleId: string,
    triggeredBy?: string | null,
    initialStatus?: Extract<AuditStatus, 'pending' | 'queued'>,
  ): Promise<Audit>;
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
