import type { AnalysisSignal, AnalyzerId } from '@ai-visibility/contracts';

export interface Analyzer<TInput> {
  readonly id: AnalyzerId;
  analyze(input: TInput): AnalysisSignal[];
}
