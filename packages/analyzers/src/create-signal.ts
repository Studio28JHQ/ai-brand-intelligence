import { createHash, randomUUID } from 'node:crypto';
import type { AnalysisSignal, AnalyzerId, SignalCategory, SignalSourceType } from '@ai-visibility/contracts';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(',')}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`);
  return `{${entries.join(',')}}`;
}

function computeFingerprint(key: string, category: SignalCategory, data: Record<string, unknown>): string {
  return createHash('sha256').update(`${key}|${category}|${stableStringify(data)}`).digest('hex');
}

export interface CreateSignalInput {
  key: string;
  category: SignalCategory;
  data: Record<string, unknown>;
  sourceType: SignalSourceType;
  sourceId: AnalyzerId | string;
  confidence?: number;
}

// The single construction path every Analyzer must use to build an AnalysisSignal — never
// hand-build the envelope, so sourceType/sourceId stay typed and signalId/fingerprint are
// always computed consistently.
export function createSignal(input: CreateSignalInput): AnalysisSignal {
  return {
    signalId: randomUUID(),
    key: input.key,
    category: input.category,
    data: input.data,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    confidence: input.confidence ?? 1,
    timestamp: new Date().toISOString(),
    fingerprint: computeFingerprint(input.key, input.category, input.data),
  };
}
