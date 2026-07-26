import { Inject, Injectable } from '@nestjs/common';
import type { AuditAnalysisView } from '@ai-visibility/contracts';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { generateOptimizationPlan } from '../optimization/generate-optimization-plan';

@Injectable()
export class AuditAnalysisQueryService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
    private readonly knowledgeGraphReadRepository: KnowledgeGraphReadRepository,
  ) {}

  async getByAuditId(auditId: string): Promise<AuditAnalysisView | null> {
    const audit = await this.auditRepository.findById(auditId);
    if (!audit || audit.status !== 'completed') {
      return null;
    }

    const [findings, assessment, knowledgeGraph] = await Promise.all([
      this.findingReadRepository.findByAuditId(auditId),
      this.aiVisibilityReadRepository.findByAuditId(auditId),
      this.knowledgeGraphReadRepository.findByAuditId(auditId),
    ]);

    const optimizationPlan = assessment
      ? generateOptimizationPlan(
          { projectId: audit.projectId, auditId, cycleId: audit.cycleId },
          findings,
          assessment,
          knowledgeGraph,
        )
      : [];

    return { auditId, findings, optimizationPlan };
  }
}
