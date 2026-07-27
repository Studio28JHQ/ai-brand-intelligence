import type { AnalysisSignal } from '@ai-visibility/contracts';

export function findSignal(signals: ReadonlyArray<AnalysisSignal>, key: string): AnalysisSignal | undefined {
  return signals.find((signal) => signal.key === key);
}
