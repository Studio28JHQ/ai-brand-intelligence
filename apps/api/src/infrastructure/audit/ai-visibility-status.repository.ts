import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { VisibilityStatus } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class AiVisibilityStatusRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findStatusByAuditId(auditId: string): Promise<VisibilityStatus | null> {
    const record = await this.prisma.aiVisibilityAssessment.findUnique({
      where: { auditId },
      select: { status: true },
    });
    return (record?.status as VisibilityStatus) ?? null;
  }

  async findStatusesByAuditIds(auditIds: string[]): Promise<Map<string, VisibilityStatus>> {
    if (auditIds.length === 0) {
      return new Map();
    }

    const records = await this.prisma.aiVisibilityAssessment.findMany({
      where: { auditId: { in: auditIds } },
      select: { auditId: true, status: true },
    });

    return new Map(records.map((record) => [record.auditId, record.status as VisibilityStatus]));
  }
}
