import { createSignal } from '@ai-visibility/analyzers';
import type { Analyzer } from '@ai-visibility/analyzers';
import type { AnalysisSignal } from '@ai-visibility/contracts';
import type { ExtractionAnalyzerInput } from '../analyzer-input';
import { matchAttribute, matchTags } from '../html-utils';

const SOURCE_ID = 'technical';

function findHeader(headers: Record<string, string>, name: string): string | null {
  const lowerName = name.toLowerCase();
  const key = Object.keys(headers).find((headerName) => headerName.toLowerCase() === lowerName);
  return key ? headers[key] : null;
}

function findMixedContentUrls(html: string, isHttps: boolean): string[] {
  if (!isHttps) {
    return [];
  }
  const urls = new Set<string>();
  for (const tagName of ['img', 'script', 'link', 'iframe']) {
    for (const tag of matchTags(html, tagName)) {
      const src = matchAttribute(tag, 'src') ?? matchAttribute(tag, 'href');
      if (src && /^http:\/\//i.test(src)) {
        urls.add(src);
      }
    }
  }
  return Array.from(urls);
}

function findLinkTagsByRel(html: string, rel: string): string[] {
  return matchTags(html, 'link')
    .filter((tag) => matchAttribute(tag, 'rel')?.toLowerCase() === rel)
    .map((tag) => matchAttribute(tag, 'href'))
    .filter((href): href is string => href !== null);
}

function findHreflangTags(html: string): Array<{ hreflang: string; href: string }> {
  return matchTags(html, 'link')
    .filter((tag) => matchAttribute(tag, 'rel')?.toLowerCase() === 'alternate' && matchAttribute(tag, 'hreflang'))
    .map((tag) => ({ hreflang: matchAttribute(tag, 'hreflang') ?? '', href: matchAttribute(tag, 'href') ?? '' }));
}

export const technicalAnalyzer: Analyzer<ExtractionAnalyzerInput> = {
  id: 'technical',
  analyze(input: ExtractionAnalyzerInput): AnalysisSignal[] {
    const { crawlResult, discoveryResult } = input;
    const { html, headers, finalUrl, redirectChain } = crawlResult;
    const isHttps = finalUrl.startsWith('https://');

    return [
      createSignal({
        key: 'https',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { isHttps },
      }),
      createSignal({
        key: 'mixed-content',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { urls: findMixedContentUrls(html, isHttps) },
      }),
      createSignal({
        key: 'redirect-chain',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { chain: redirectChain, wasRedirected: redirectChain.length > 0 },
      }),
      createSignal({
        key: 'technical-files',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          robotsTxtDetected: discoveryResult.robotsTxtDetected,
          sitemapDetected: discoveryResult.sitemapDetected,
        },
      }),
      createSignal({
        key: 'headers',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          compressionDetected: findHeader(headers, 'content-encoding') !== null,
          cacheHeadersPresent: findHeader(headers, 'cache-control') !== null || findHeader(headers, 'expires') !== null,
        },
      }),
      createSignal({
        key: 'hreflang',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { tags: findHreflangTags(html) },
      }),
      createSignal({
        key: 'pagination',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          next: findLinkTagsByRel(html, 'next')[0] ?? null,
          prev: findLinkTagsByRel(html, 'prev')[0] ?? null,
        },
      }),
      createSignal({
        key: 'favicon',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          present:
            findLinkTagsByRel(html, 'icon').length > 0 ||
            findLinkTagsByRel(html, 'shortcut icon').length > 0,
        },
      }),
      createSignal({
        key: 'manifest',
        category: 'technical',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { present: findLinkTagsByRel(html, 'manifest').length > 0 },
      }),
    ];
  },
};
