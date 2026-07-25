import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { InventoryResult } from '@ai-visibility/contracts';

export async function saveInventoryResult(auditId: string, result: InventoryResult): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  await prisma.inventoryResult.upsert({
    where: { auditId },
    create: {
      auditId,
      title: result.title,
      metaDescription: result.metaDescription,
      canonicalUrl: result.canonicalUrl,
      language: result.language,
      charset: result.charset,
      h1Count: result.h1Count,
      internalLinkCount: result.internalLinkCount,
      externalLinkCount: result.externalLinkCount,
    },
    update: {
      title: result.title,
      metaDescription: result.metaDescription,
      canonicalUrl: result.canonicalUrl,
      language: result.language,
      charset: result.charset,
      h1Count: result.h1Count,
      internalLinkCount: result.internalLinkCount,
      externalLinkCount: result.externalLinkCount,
    },
  });
}
