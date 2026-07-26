import type { OptimizationPatternMetadata } from '@ai-visibility/contracts';
import { OptimizationPattern } from '../../domain/optimization-pattern/optimization-pattern.entity';

export function toOptimizationPatternMetadata(pattern: OptimizationPattern): OptimizationPatternMetadata {
  return {
    id: pattern.id,
    optimizationRuleId: pattern.optimizationRuleId,
    category: pattern.category,
    occurrenceCount: pattern.occurrenceCount,
    distinctProjectCount: pattern.distinctProjectCount,
    confidence: pattern.confidence,
    status: pattern.status,
    discoveredAt: pattern.discoveredAt.toISOString(),
    lastRecomputedAt: pattern.lastRecomputedAt.toISOString(),
    invalidatedAt: pattern.invalidatedAt ? pattern.invalidatedAt.toISOString() : null,
  };
}
