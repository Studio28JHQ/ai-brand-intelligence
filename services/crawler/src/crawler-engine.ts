import type { CrawlResult } from '@ai-visibility/contracts';
import { saveCrawlResult } from './crawl-repository';

async function performCrawl(url: string): Promise<CrawlResult> {
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    const html = await response.text();

    return {
      finalUrl: response.url,
      httpStatus: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      html,
      success: response.ok,
    };
  } catch {
    return {
      finalUrl: url,
      httpStatus: 0,
      headers: {},
      html: '',
      success: false,
    };
  }
}

export async function runCrawl(auditId: string, url: string): Promise<CrawlResult> {
  const result = await performCrawl(url);
  await saveCrawlResult(auditId, result);
  return result;
}
