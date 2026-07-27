import type { SignalCategory } from './signal';

export type HeuristicScope = 'core' | 'ai-visibility';

export interface Heuristic {
  key: string;
  category: SignalCategory;
  version: string;
  value: Record<string, unknown>;
  contributingSignalKeys: string[];
}

export interface HeuristicResult {
  heuristics: Heuristic[];
}
