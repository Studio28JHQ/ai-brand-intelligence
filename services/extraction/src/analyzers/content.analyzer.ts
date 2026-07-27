import { createSignal } from '@ai-visibility/analyzers';
import type { Analyzer } from '@ai-visibility/analyzers';
import type { AnalysisSignal } from '@ai-visibility/contracts';
import type { ExtractionAnalyzerInput } from '../analyzer-input';
import { countWords, decodeHtmlEntities, matchAttribute, matchTags, stripTags } from '../html-utils';

const SOURCE_ID = 'content';
const HEADING_LEVELS = [1, 2, 3, 4, 5, 6];

interface HeadingEntry {
  level: number;
  text: string;
}

function extractHeadings(html: string): HeadingEntry[] {
  const headings: Array<{ level: number; text: string; index: number }> = [];
  for (const level of HEADING_LEVELS) {
    const pattern = new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)</h${level}>`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      headings.push({ level, text: decodeHtmlEntities(stripTags(match[1])).trim(), index: match.index });
    }
  }
  return headings.sort((a, b) => a.index - b.index).map(({ level, text }) => ({ level, text }));
}

function findHierarchySkips(headings: HeadingEntry[]): Array<{ from: number; to: number }> {
  const skips: Array<{ from: number; to: number }> = [];
  for (let i = 1; i < headings.length; i += 1) {
    const previous = headings[i - 1].level;
    const current = headings[i].level;
    if (current > previous + 1) {
      skips.push({ from: previous, to: current });
    }
  }
  return skips;
}

function extractBodyText(html: string): string {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

export const contentAnalyzer: Analyzer<ExtractionAnalyzerInput> = {
  id: 'content',
  analyze(input: ExtractionAnalyzerInput): AnalysisSignal[] {
    const { html } = input.crawlResult;
    const headings = extractHeadings(html);
    const h1Headings = headings.filter((heading) => heading.level === 1);
    const emptyHeadings = headings.filter((heading) => heading.text.length === 0);
    const images = matchTags(html, 'img');
    const wordCount = countWords(extractBodyText(html));

    const missingAlt = images.filter((tag) => matchAttribute(tag, 'alt') === null);
    const emptyAlt = images.filter((tag) => matchAttribute(tag, 'alt') === '');
    const missingDimensions = images.filter(
      (tag) => matchAttribute(tag, 'width') === null || matchAttribute(tag, 'height') === null,
    );
    const lazyLoaded = images.filter((tag) => matchAttribute(tag, 'loading')?.toLowerCase() === 'lazy');

    return [
      createSignal({
        key: 'heading-hierarchy',
        category: 'content',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          headings,
          h1Count: h1Headings.length,
          emptyHeadingCount: emptyHeadings.length,
          hierarchySkips: findHierarchySkips(headings),
        },
      }),
      createSignal({
        key: 'word-count',
        category: 'content',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { wordCount },
      }),
      createSignal({
        key: 'image-accessibility',
        category: 'content',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          totalImages: images.length,
          missingAltCount: missingAlt.length,
          emptyAltCount: emptyAlt.length,
          missingDimensionsCount: missingDimensions.length,
          lazyLoadedCount: lazyLoaded.length,
        },
      }),
    ];
  },
};
