import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { AiVisibilityAssessment } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class AiVisibilityReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findByAuditId(auditId: string): Promise<AiVisibilityAssessment | null> {
    const record = await this.prisma.aiVisibilityAssessment.findUnique({ where: { auditId } });
    if (!record) {
      return null;
    }

    return {
      auditId: record.auditId,
      status: record.status as AiVisibilityAssessment['status'],
      graphCompleteness: record.graphCompleteness as AiVisibilityAssessment['graphCompleteness'],
      entityCoverage: record.entityCoverage as AiVisibilityAssessment['entityCoverage'],
      relationshipCoverage: record.relationshipCoverage as AiVisibilityAssessment['relationshipCoverage'],
      missingSignals: record.missingSignals as string[],
      assessedAt: record.assessedAt.toISOString(),
    };
  }
}
