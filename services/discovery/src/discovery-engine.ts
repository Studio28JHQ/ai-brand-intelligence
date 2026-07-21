import { normalizeUrl } from './normalize-url';
import { detectResource } from './detect-resource';
import { saveDiscoveryResult } from './discovery-repository';
import type { DiscoveryResult } from './discovery.types';

export async function runDiscovery(auditId: string, rawUrl: string): Promise<DiscoveryResult> {
  const normalizedUrl = normalizeUrl(rawUrl);
  const origin = new URL(normalizedUrl).origin;
  const robotsTxtUrl = `${origin}/robots.txt`;
  const sitemapUrl = `${origin}/sitemap.xml`;

  const [robotsTxtDetected, sitemapDetected] = await Promise.all([
    detectResource(robotsTxtUrl),
    detectResource(sitemapUrl),
  ]);

  const result: DiscoveryResult = {
    normalizedUrl,
    robotsTxtUrl,
    robotsTxtDetected,
    sitemapUrl,
    sitemapDetected,
  };

  await saveDiscoveryResult(auditId, result);

  return result;
}
