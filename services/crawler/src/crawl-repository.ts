import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { CrawlResult } from '@ai-visibility/contracts';

export async function saveCrawlResult(auditId: string, result: CrawlResult): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  await prisma.crawlResult.upsert({
    where: { auditId },
    create: {
      auditId,
      finalUrl: result.finalUrl,
      httpStatus: result.httpStatus,
      headers: result.headers,
      html: result.html,
      success: result.success,
    },
    update: {
      finalUrl: result.finalUrl,
      httpStatus: result.httpStatus,
      headers: result.headers,
      html: result.html,
      success: result.success,
    },
  });
}
