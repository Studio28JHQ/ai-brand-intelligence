import { createSignal } from '@ai-visibility/analyzers';
import type { Analyzer } from '@ai-visibility/analyzers';
import type { AnalysisSignal } from '@ai-visibility/contracts';
import type { ExtractionAnalyzerInput } from '../analyzer-input';

const SOURCE_ID = 'metadata';

export const metadataAnalyzer: Analyzer<ExtractionAnalyzerInput> = {
  id: 'metadata',
  analyze(input: ExtractionAnalyzerInput): AnalysisSignal[] {
    const { title, metaDescription } = input.inventoryResult;

    return [
      createSignal({
        key: 'title',
        category: 'metadata',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          exists: title !== null,
          text: title,
          length: title?.length ?? 0,
        },
      }),
      createSignal({
        key: 'meta-description',
        category: 'metadata',
        sourceType: 'analyzer',
        sourceId: SOURCE_ID,
        data: {
          exists: metaDescription !== null,
          text: metaDescription,
          length: metaDescription?.length ?? 0,
        },
      }),
    ];
  },
};
