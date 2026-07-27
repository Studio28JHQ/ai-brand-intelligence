import { createSignal } from '@ai-visibility/analyzers';
import type { Analyzer } from '@ai-visibility/analyzers';
import type { AnalysisSignal } from '@ai-visibility/contracts';
import type { ExtractionAnalyzerInput } from '../analyzer-input';
import { matchAttribute, matchTags, matchTagsWithContent } from '../html-utils';

const SOURCE_ID = 'seo';

function findHeader(headers: Record<string, string>, name: string): string | null {
  const lowerName = name.toLowerCase();
  const key = Object.keys(headers).find((headerName) => headerName.toLowerCase() === lowerName);
  return key ? headers[key] : null;
}

function extractMetaRobots(html: string): string | null {
  for (const tag of matchTags(html, 'meta')) {
    if (matchAttribute(tag, 'name')?.toLowerCase() === 'robots') {
      return matchAttribute(tag, 'content');
    }
  }
  return null;
}

function extractOpenGraphTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  for (const tag of matchTags(html, 'meta')) {
    const property = matchAttribute(tag, 'property');
    if (property?.toLowerCase().startsWith('og:')) {
      const content = matchAttribute(tag, 'content');
      if (content) {
        tags[property] = content;
      }
    }
  }
  return tags;
}

function extractTwitterCardTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  for (const tag of matchTags(html, 'meta')) {
    const name = matchAttribute(tag, 'name');
    if (name?.toLowerCase().startsWith('twitter:')) {
      const content = matchAttribute(tag, 'content');
      if (content) {
        tags[name] = content;
      }
    }
  }
  return tags;
}

interface JsonLdBlockSummary {
  valid: boolean;
  type: string | null;
}

function extractJsonLdBlocks(html: string): JsonLdBlockSummary[] {
  return matchTagsWithContent(html, 'script')
    .filter(({ tag }) => matchAttribute(tag, 'type')?.toLowerCase() === 'application/ld+json')
    .map(({ content }) => {
      try {
        const parsed = JSON.parse(content);
        const hasContext = typeof parsed === 'object' && parsed !== null && '@context' in parsed;
        const type = typeof parsed === 'object' && parsed !== null && typeof parsed['@type'] === 'string' ? parsed['@type'] : null;
        return { valid: hasContext, type };
      } catch {
        return { valid: false, type: null };
      }
    });
}

function isSelfReferencing(canonicalUrl: string | null, finalUrl: string): boolean {
  if (!canonicalUrl) {
    return false;
  }
  try {
    return new URL(canonicalUrl, finalUrl).href.replace(/\/$/, '') === new URL(finalUrl).href.replace(/\/$/, '');
  } catch {
    return false;
  }
}

export const seoAnalyzer: Analyzer<ExtractionAnalyzerInput> = {
  id: 'seo',
  analyze(input: ExtractionAnalyzerInput): AnalysisSignal[] {
    const { crawlResult, inventoryResult } = input;
    const { html, headers, finalUrl } = crawlResult;
    const jsonLdBlocks = extractJsonLdBlocks(html);
    const openGraphTags = extractOpenGraphTags(html);
    const twitterCardTags = extractTwitterCardTags(html);

    return [
      createSignal({
        key: 'indexability',
        category: 'seo',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          httpStatus: crawlResult.httpStatus,
          metaRobots: extractMetaRobots(html),
          xRobotsTagHeader: findHeader(headers, 'x-robots-tag'),
        },
      }),
      createSignal({
        key: 'canonical',
        category: 'seo',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          canonicalUrl: inventoryResult.canonicalUrl,
          isSelfReferencing: isSelfReferencing(inventoryResult.canonicalUrl, finalUrl),
        },
      }),
      createSignal({
        key: 'url-structure',
        category: 'seo',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { url: finalUrl, length: finalUrl.length },
      }),
      createSignal({
        key: 'link-counts',
        category: 'seo',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          internalLinkCount: inventoryResult.internalLinkCount,
          externalLinkCount: inventoryResult.externalLinkCount,
        },
      }),
      createSignal({
        key: 'structured-data',
        category: 'seo',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          jsonLdBlockCount: jsonLdBlocks.length,
          jsonLdValidCount: jsonLdBlocks.filter((block) => block.valid).length,
          jsonLdTypes: jsonLdBlocks.map((block) => block.type).filter((type): type is string => type !== null),
          hasOpenGraph: Object.keys(openGraphTags).length > 0,
          openGraphTags,
          hasTwitterCard: Object.keys(twitterCardTags).length > 0,
          twitterCardTags,
        },
      }),
    ];
  },
};
