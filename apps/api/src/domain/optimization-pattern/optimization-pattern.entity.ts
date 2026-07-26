import type { OptimizationLevel, PatternStatus } from '@ai-visibility/contracts';
import { InvalidPatternStateTransitionError } from './optimization-pattern.errors';

export interface OptimizationPatternProps {
  id: string;
  optimizationRuleId: string;
  category: string;
  occurrenceCount: number;
  distinctProjectCount: number;
  confidence: OptimizationLevel;
  status: PatternStatus;
  discoveredAt: Date;
  lastRecomputedAt: Date;
  invalidatedAt: Date | null;
}

const VALID_TRANSITIONS: Record<PatternStatus, ReadonlyArray<PatternStatus>> = {
  // Findings are append-only (never deleted) in this platform, so recomputed occurrence/distinct-
  // project counts can only grow over time — a pattern that has already crossed the "recurring"
  // threshold can never legitimately fall back below it. The only forward paths are becoming
  // recurring enough to go active, or being manually retired.
  candidate: ['active', 'invalidated'],
  active: ['invalidated'],
  invalidated: [],
};

/**
 * Threshold: a rule seen in only one distinct Project isn't a "recurring" pattern yet — it's a
 * single occurrence. Two or more distinct Projects is the minimum bar for "recurring" to be a
 * meaningful claim; five or more is treated as strong, high-confidence recurrence. These are
 * deterministic, documented thresholds (`docs/04_PROJECT/CURRENT_STATE.md`), not a black box.
 */
export function computeConfidence(distinctProjectCount: number): OptimizationLevel {
  if (distinctProjectCount >= 5) {
    return 'high';
  }
  if (distinctProjectCount >= 2) {
    return 'medium';
  }
  return 'low';
}

export function computeStatus(distinctProjectCount: number): 'candidate' | 'active' {
  return distinctProjectCount >= 2 ? 'active' : 'candidate';
}

export class OptimizationPattern {
  private constructor(
    public readonly id: string,
    public readonly optimizationRuleId: string,
    public readonly category: string,
    public readonly occurrenceCount: number,
    public readonly distinctProjectCount: number,
    public readonly confidence: OptimizationLevel,
    public readonly status: PatternStatus,
    public readonly discoveredAt: Date,
    public readonly lastRecomputedAt: Date,
    public readonly invalidatedAt: Date | null,
  ) {}

  static fromPersistence(props: OptimizationPatternProps): OptimizationPattern {
    return new OptimizationPattern(
      props.id,
      props.optimizationRuleId,
      props.category,
      props.occurrenceCount,
      props.distinctProjectCount,
      props.confidence,
      props.status,
      props.discoveredAt,
      props.lastRecomputedAt,
      props.invalidatedAt,
    );
  }

  /** Refuses to resurrect a manually invalidated pattern — invalidation is a deliberate, terminal decision, not something an automatic recompute should silently override. */
  recompute(occurrenceCount: number, distinctProjectCount: number, now: Date): OptimizationPattern {
    if (this.status === 'invalidated') {
      throw new InvalidPatternStateTransitionError(this.status, 'recomputed');
    }

    return new OptimizationPattern(
      this.id,
      this.optimizationRuleId,
      this.category,
      occurrenceCount,
      distinctProjectCount,
      computeConfidence(distinctProjectCount),
      computeStatus(distinctProjectCount),
      this.discoveredAt,
      now,
      this.invalidatedAt,
    );
  }

  invalidate(now: Date): OptimizationPattern {
    if (!VALID_TRANSITIONS[this.status].includes('invalidated')) {
      throw new InvalidPatternStateTransitionError(this.status, 'invalidated');
    }

    return new OptimizationPattern(
      this.id,
      this.optimizationRuleId,
      this.category,
      this.occurrenceCount,
      this.distinctProjectCount,
      this.confidence,
      'invalidated',
      this.discoveredAt,
      this.lastRecomputedAt,
      now,
    );
  }
}
