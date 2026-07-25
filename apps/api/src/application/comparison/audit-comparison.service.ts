import { Injectable, Inject } from '@nestjs/common';
import type { AuditComparisonResult } from '@ai-visibility/contracts';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { AuditNotFoundError, AuditNotCompletedError } from '../../domain/audit/audit.errors';
import { compareFindings } from '../../domain/comparison/compare-findings';
import { compareEntities } from '../../domain/comparison/compare-entities';
import { compareAiVisibility } from '../../domain/comparison/compare-ai-visibility';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { EntityReadRepository } from '../../infrastructure/comparison/entity-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';

@Injectable()
export class AuditComparisonService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly entityReadRepository: EntityReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
  ) {}

  async compare(baselineAuditId: string, targetAuditId: string): Promise<AuditComparisonResult> {
    const [baselineAudit, targetAudit] = await Promise.all([
      this.auditRepository.findById(baselineAuditId),
      this.auditRepository.findById(targetAuditId),
    ]);

    if (!baselineAudit) {
      throw new AuditNotFoundError(baselineAuditId);
    }
    if (!targetAudit) {
      throw new AuditNotFoundError(targetAuditId);
    }
    if (baselineAudit.status !== 'completed') {
      throw new AuditNotCompletedError(baselineAuditId);
    }
    if (targetAudit.status !== 'completed') {
      throw new AuditNotCompletedError(targetAuditId);
    }

    const [baselineFindings, targetFindings, baselineEntities, targetEntities, baselineAiVisibility, targetAiVisibility] =
      await Promise.all([
        this.findingReadRepository.findByAuditId(baselineAuditId),
        this.findingReadRepository.findByAuditId(targetAuditId),
        this.entityReadRepository.findByAuditId(baselineAuditId),
        this.entityReadRepository.findByAuditId(targetAuditId),
        this.aiVisibilityReadRepository.findByAuditId(baselineAuditId),
        this.aiVisibilityReadRepository.findByAuditId(targetAuditId),
      ]);

    if (!baselineAiVisibility) {
      throw new AuditNotCompletedError(baselineAuditId);
    }
    if (!targetAiVisibility) {
      throw new AuditNotCompletedError(targetAuditId);
    }

    return {
      baselineAuditId,
      targetAuditId,
      findings: compareFindings(baselineFindings, targetFindings),
      entities: compareEntities(baselineEntities, targetEntities),
      aiVisibility: compareAiVisibility(baselineAiVisibility, targetAiVisibility),
    };
  }
}
