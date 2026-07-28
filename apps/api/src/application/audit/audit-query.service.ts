import { Inject, Injectable } from '@nestjs/common';
import type { VisibilityStatus, WorkflowExecutionRecord } from '@ai-visibility/contracts';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { AiVisibilityStatusRepository } from '../../infrastructure/audit/ai-visibility-status.repository';
import { WorkflowExecutionHistoryRepository } from '../../infrastructure/audit/workflow-execution-history.repository';
import { computeQueueInfo } from './audit-queue-info';

export interface AuditQueryResult {
  audit: Audit;
  aiVisibilityStatus: VisibilityStatus | null;
  executionHistory: WorkflowExecutionRecord[];
  // Real-data-derived, never fabricated (F10-S04D, see docs/04_PROJECT/DECISION_LOG.md#cto-106):
  // both null unless `audit.status === 'queued'`. `queuePosition` is 1-indexed among this Audit's
  // Project's other 'queued' Audits, ordered by createdAt. `estimatedStartAt` is an honest estimate
  // from real past Audit durations (this Project's own history, falling back to a platform-wide
  // average, falling back to null — "Calculating…" — if neither exists yet), not a guess.
  queuePosition: number | null;
  estimatedStartAt: string | null;
  // The most recent other 'completed' Audit for the same Project+URL requested before this one —
  // what "Compare With Previous" compares against. Null if this is the first Audit of this URL.
  previousAuditId: string | null;
}

@Injectable()
export class AuditQueryService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly aiVisibilityStatusRepository: AiVisibilityStatusRepository,
    private readonly workflowExecutionHistoryRepository: WorkflowExecutionHistoryRepository,
  ) {}

  async list(): Promise<AuditQueryResult[]> {
    const audits = await this.auditRepository.findAll();
    const auditIds = audits.map((audit) => audit.id);
    const statuses = await this.aiVisibilityStatusRepository.findStatusesByAuditIds(auditIds);
    const histories = await this.workflowExecutionHistoryRepository.findByAuditIds(auditIds);

    return audits.map((audit) => this.toResult(audit, audits, statuses.get(audit.id) ?? null, histories.get(audit.id) ?? []));
  }

  async getById(id: string): Promise<AuditQueryResult | null> {
    const audit = await this.auditRepository.findById(id);
    if (!audit) {
      return null;
    }

    const [allAudits, aiVisibilityStatus, executionHistory] = await Promise.all([
      this.auditRepository.findAll(),
      this.aiVisibilityStatusRepository.findStatusByAuditId(id),
      this.workflowExecutionHistoryRepository.findByAuditId(id),
    ]);
    return this.toResult(audit, allAudits, aiVisibilityStatus, executionHistory);
  }

  async getLatest(): Promise<AuditQueryResult | null> {
    const audit = await this.auditRepository.findLatest();
    if (!audit) {
      return null;
    }

    const [allAudits, aiVisibilityStatus, executionHistory] = await Promise.all([
      this.auditRepository.findAll(),
      this.aiVisibilityStatusRepository.findStatusByAuditId(audit.id),
      this.workflowExecutionHistoryRepository.findByAuditId(audit.id),
    ]);
    return this.toResult(audit, allAudits, aiVisibilityStatus, executionHistory);
  }

  private toResult(
    audit: Audit,
    allAudits: Audit[],
    aiVisibilityStatus: VisibilityStatus | null,
    executionHistory: WorkflowExecutionRecord[],
  ): AuditQueryResult {
    return {
      audit,
      aiVisibilityStatus,
      executionHistory,
      ...computeQueueInfo(audit, allAudits),
      previousAuditId: this.findPreviousAuditId(audit, allAudits),
    };
  }

  private findPreviousAuditId(audit: Audit, allAudits: Audit[]): string | null {
    const candidates = allAudits
      .filter(
        (candidate) =>
          candidate.projectId === audit.projectId &&
          candidate.url === audit.url &&
          candidate.status === 'completed' &&
          candidate.createdAt.getTime() < audit.createdAt.getTime(),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return candidates[0]?.id ?? null;
  }
}
