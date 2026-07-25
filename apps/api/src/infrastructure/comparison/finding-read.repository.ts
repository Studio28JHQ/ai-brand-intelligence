import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { Finding } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class FindingReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findByAuditId(auditId: string): Promise<Finding[]> {
    const records = await this.prisma.finding.findMany({ where: { auditId } });
    return records.map((record) => ({
      id: record.id,
      auditId: record.auditId,
      ruleId: record.ruleId,
      ruleVersion: record.ruleVersion,
      category: record.category,
      sourceEngine: record.sourceEngine,
      outcome: record.outcome as Finding['outcome'],
      severity: record.severity as Finding['severity'],
      evidence: record.evidence as Record<string, unknown>,
    }));
  }
}
