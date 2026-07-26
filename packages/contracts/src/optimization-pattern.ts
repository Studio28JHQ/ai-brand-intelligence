import type { OptimizationLevel } from './optimization-plan';

export type PatternStatus = 'candidate' | 'active' | 'invalidated';

/**
 * Cross-Client aggregate intelligence about a recurring Optimization Rule — never carries a
 * Client/Project/Audit id, name, URL, or raw Finding evidence. Keyed only by the static
 * `optimizationRuleId` from the Optimization Knowledge Base.
 */
export interface OptimizationPatternMetadata {
  id: string;
  optimizationRuleId: string;
  category: string;
  occurrenceCount: number;
  distinctProjectCount: number;
  confidence: OptimizationLevel;
  status: PatternStatus;
  discoveredAt: string;
  lastRecomputedAt: string;
  invalidatedAt: string | null;
}

export interface PatternDiscoverySummary {
  discovered: number;
  updated: number;
  skippedInvalidated: number;
}
