import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class CrawlResultReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  // Only `html` is selected — this backs "Reaudit Changed Pages Only" (F10-S04D, see
  // docs/04_PROJECT/DECISION_LOG.md#cto-106) hash-comparing stored vs. freshly-fetched content,
  // which needs nothing else from CrawlResult.
  async findHtmlByAuditId(auditId: string): Promise<string | null> {
    const record = await this.prisma.crawlResult.findUnique({ where: { auditId }, select: { html: true } });
    return record?.html ?? null;
  }
}
