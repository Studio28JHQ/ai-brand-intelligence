import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { CrawlResult } from '@ai-visibility/contracts';
import { saveCrawlResult } from './crawl-repository';

const MAX_REDIRECT_HOPS = 10;

async function performCrawl(url: string): Promise<CrawlResult> {
  const redirectChain: string[] = [];
  let currentUrl = url;

  try {
    for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
      const response = await fetch(currentUrl, { method: 'GET', redirect: 'manual' });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          break;
        }
        redirectChain.push(currentUrl);
        currentUrl = new URL(location, currentUrl).href;
        continue;
      }

      const html = await response.text();
      return {
        finalUrl: currentUrl,
        httpStatus: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        html,
        success: response.ok,
        redirectChain,
      };
    }

    return {
      finalUrl: currentUrl,
      httpStatus: 0,
      headers: {},
      html: '',
      success: false,
      redirectChain,
    };
  } catch {
    return {
      finalUrl: currentUrl,
      httpStatus: 0,
      headers: {},
      html: '',
      success: false,
      redirectChain,
    };
  }
}

export async function runCrawl(auditId: string, url: string, correlationId: string): Promise<CrawlResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'crawler',
    data: { auditId },
  });

  try {
    const result = await performCrawl(url);
    await saveCrawlResult(auditId, result);

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'crawler',
      data: { auditId },
    });

    return result;
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'crawler',
      data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
