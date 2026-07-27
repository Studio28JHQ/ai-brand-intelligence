export type SignalCategory = 'seo' | 'technical' | 'content' | 'metadata' | 'performance' | 'ai-visibility';

export type SignalSourceType = 'analyzer' | 'ai-provider';

export type AnalyzerId = 'seo' | 'technical' | 'content' | 'metadata' | 'performance' | 'ai-visibility';

export interface AnalysisSignal {
  signalId: string;
  key: string;
  category: SignalCategory;
  data: Record<string, unknown>;
  sourceType: SignalSourceType;
  sourceId: string;
  confidence: number;
  timestamp: string;
  fingerprint: string;
}

export interface ExtractionResult {
  signals: AnalysisSignal[];
}
