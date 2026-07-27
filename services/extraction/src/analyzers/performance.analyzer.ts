import { createSignal } from '@ai-visibility/analyzers';
import type { Analyzer } from '@ai-visibility/analyzers';
import type { AnalysisSignal } from '@ai-visibility/contracts';
import type { ExtractionAnalyzerInput } from '../analyzer-input';
import { hasAttribute, matchTags, matchTagsWithContent } from '../html-utils';

const SOURCE_ID = 'performance';

function countDomElements(html: string): number {
  const matches = html.match(/<[a-z][a-z0-9]*(\s|>|\/>)/gi);
  return matches ? matches.length : 0;
}

export const performanceAnalyzer: Analyzer<ExtractionAnalyzerInput> = {
  id: 'performance',
  analyze(input: ExtractionAnalyzerInput): AnalysisSignal[] {
    const { html } = input.crawlResult;
    const scriptBlocks = matchTagsWithContent(html, 'script');
    const externalScripts = scriptBlocks.filter(({ tag }) => /\bsrc\s*=/.test(tag));
    const inlineScripts = scriptBlocks.filter(({ tag }) => !/\bsrc\s*=/.test(tag));
    const blockingScripts = externalScripts.filter(
      ({ tag }) => !hasAttribute(tag, 'async') && !hasAttribute(tag, 'defer') && !/type\s*=\s*["']module["']/i.test(tag),
    );
    const styleBlocks = matchTagsWithContent(html, 'style');
    const externalStylesheets = matchTags(html, 'link').filter((tag) => /rel\s*=\s*["']stylesheet["']/i.test(tag));
    const inlineStyleAttributeCount = (html.match(/\bstyle\s*=\s*"/gi) ?? []).length;
    const imageCount = matchTags(html, 'img').length;

    return [
      createSignal({
        key: 'html-size',
        category: 'performance',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { htmlSizeBytes: Buffer.byteLength(html, 'utf8') },
      }),
      createSignal({
        key: 'dom-size',
        category: 'performance',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: { domElementCount: countDomElements(html) },
      }),
      createSignal({
        key: 'script-payload',
        category: 'performance',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          externalScriptCount: externalScripts.length,
          inlineScriptCount: inlineScripts.length,
          inlineScriptBytes: inlineScripts.reduce((total, { content }) => total + Buffer.byteLength(content, 'utf8'), 0),
          blockingScriptCount: blockingScripts.length,
        },
      }),
      createSignal({
        key: 'style-payload',
        category: 'performance',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          externalStylesheetCount: externalStylesheets.length,
          inlineStyleBlockCount: styleBlocks.length,
          inlineStyleBytes: styleBlocks.reduce((total, { content }) => total + Buffer.byteLength(content, 'utf8'), 0),
          inlineStyleAttributeCount,
        },
      }),
      createSignal({
        key: 'estimated-request-count',
        category: 'performance',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          count: externalScripts.length + externalStylesheets.length + imageCount + 1,
        },
      }),
    ];
  },
};
