import type { Analyzer } from '@ai-visibility/analyzers';
import type { ExtractionAnalyzerInput } from '../analyzer-input';
import { seoAnalyzer } from './seo.analyzer';
import { technicalAnalyzer } from './technical.analyzer';
import { contentAnalyzer } from './content.analyzer';
import { metadataAnalyzer } from './metadata.analyzer';
import { performanceAnalyzer } from './performance.analyzer';

// Adding a future analyzer means adding one file + one entry here — nothing else in the
// workflow pipeline (capability catalog, DI wiring) needs to change.
export const ANALYZER_REGISTRY: ReadonlyArray<Analyzer<ExtractionAnalyzerInput>> = [
  seoAnalyzer,
  technicalAnalyzer,
  contentAnalyzer,
  metadataAnalyzer,
  performanceAnalyzer,
];
