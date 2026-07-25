import { Inject, Injectable } from '@nestjs/common';
import type { VisibilityStatus, WorkflowExecutionRecord } from '@ai-visibility/contracts';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { AiVisibilityStatusRepository } from '../../infrastructure/audit/ai-visibility-status.repository';
import { WorkflowExecutionHistoryRepository } from '../../infrastructure/audit/workflow-execution-history.repository';

export interface AuditQueryResult {
  audit: Audit;
  aiVisibilityStatus: VisibilityStatus | null;
  executionHistory: WorkflowExecutionRecord[];
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

    return audits.map((audit) => ({
      audit,
      aiVisibilityStatus: statuses.get(audit.id) ?? null,
      executionHistory: histories.get(audit.id) ?? [],
    }));
  }

  async getById(id: string): Promise<AuditQueryResult | null> {
    const audit = await this.auditRepository.findById(id);
    if (!audit) {
      return null;
    }

    const aiVisibilityStatus = await this.aiVisibilityStatusRepository.findStatusByAuditId(id);
    const executionHistory = await this.workflowExecutionHistoryRepository.findByAuditId(id);
    return { audit, aiVisibilityStatus, executionHistory };
  }

  async getLatest(): Promise<AuditQueryResult | null> {
    const audit = await this.auditRepository.findLatest();
    if (!audit) {
      return null;
    }

    const aiVisibilityStatus = await this.aiVisibilityStatusRepository.findStatusByAuditId(audit.id);
    const executionHistory = await this.workflowExecutionHistoryRepository.findByAuditId(audit.id);
    return { audit, aiVisibilityStatus, executionHistory };
  }
}
