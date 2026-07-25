import { Inject, Injectable } from '@nestjs/common';
import type { VisibilityStatus } from '@ai-visibility/contracts';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { AiVisibilityStatusRepository } from '../../infrastructure/audit/ai-visibility-status.repository';

export interface AuditQueryResult {
  audit: Audit;
  aiVisibilityStatus: VisibilityStatus | null;
}

@Injectable()
export class AuditQueryService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly aiVisibilityStatusRepository: AiVisibilityStatusRepository,
  ) {}

  async list(): Promise<AuditQueryResult[]> {
    const audits = await this.auditRepository.findAll();
    const statuses = await this.aiVisibilityStatusRepository.findStatusesByAuditIds(audits.map((audit) => audit.id));

    return audits.map((audit) => ({
      audit,
      aiVisibilityStatus: statuses.get(audit.id) ?? null,
    }));
  }

  async getById(id: string): Promise<AuditQueryResult | null> {
    const audit = await this.auditRepository.findById(id);
    if (!audit) {
      return null;
    }

    const aiVisibilityStatus = await this.aiVisibilityStatusRepository.findStatusByAuditId(id);
    return { audit, aiVisibilityStatus };
  }

  async getLatest(): Promise<AuditQueryResult | null> {
    const audit = await this.auditRepository.findLatest();
    if (!audit) {
      return null;
    }

    const aiVisibilityStatus = await this.aiVisibilityStatusRepository.findStatusByAuditId(audit.id);
    return { audit, aiVisibilityStatus };
  }
}
