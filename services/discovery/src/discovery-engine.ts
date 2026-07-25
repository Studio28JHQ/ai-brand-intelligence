import { emitTelemetryEvent } from '@ai-visibility/shared';
import { normalizeUrl } from './normalize-url';
import { detectResource } from './detect-resource';
import { saveDiscoveryResult } from './discovery-repository';
import type { DiscoveryResult } from './discovery.types';

export async function runDiscovery(auditId: string, rawUrl: string, correlationId: string): Promise<DiscoveryResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'discovery',
    data: { auditId },
  });

  try {
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

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'discovery',
      data: { auditId },
    });

    return result;
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'discovery',
      data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
