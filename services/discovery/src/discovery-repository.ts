import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { DiscoveryResult } from './discovery.types';

export async function saveDiscoveryResult(auditId: string, result: DiscoveryResult): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  await prisma.discoveryResult.upsert({
    where: { auditId },
    create: {
      auditId,
      normalizedUrl: result.normalizedUrl,
      robotsTxtUrl: result.robotsTxtUrl,
      robotsTxtDetected: result.robotsTxtDetected,
      sitemapUrl: result.sitemapUrl,
      sitemapDetected: result.sitemapDetected,
    },
    update: {
      normalizedUrl: result.normalizedUrl,
      robotsTxtUrl: result.robotsTxtUrl,
      robotsTxtDetected: result.robotsTxtDetected,
      sitemapUrl: result.sitemapUrl,
      sitemapDetected: result.sitemapDetected,
    },
  });
}
