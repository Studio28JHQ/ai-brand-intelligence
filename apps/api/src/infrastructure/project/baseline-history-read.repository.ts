import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { PRISMA_CLIENT } from '../database/database.module';

export interface BaselineHistoryEntry {
  auditId: string;
  setAt: Date;
}

@Injectable()
export class BaselineHistoryReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findLatestByProjectId(projectId: string): Promise<BaselineHistoryEntry | null> {
    const record = await this.prisma.projectBaselineHistory.findFirst({
      where: { projectId },
      orderBy: { setAt: 'desc' },
    });
    return record ? { auditId: record.auditId, setAt: record.setAt } : null;
  }
}
