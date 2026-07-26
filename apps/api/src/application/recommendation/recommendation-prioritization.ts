import type { AiVisibilityAssessment, RecommendationLevel, RecommendationPriority } from '@ai-visibility/contracts';

const LEVEL_SCORE: Record<RecommendationLevel, number> = { low: 1, medium: 2, high: 3 };

const EFFORT_FAVORABILITY: Record<RecommendationLevel, RecommendationLevel> = {
  low: 'high',
  medium: 'medium',
  high: 'low',
};

const HIGH_PRIORITY_THRESHOLD = 11;
const MEDIUM_PRIORITY_THRESHOLD = 8;

export function deriveExpectedImpact(assessmentStatus: AiVisibilityAssessment['status']): RecommendationLevel {
  if (assessmentStatus === 'not-ready') {
    return 'high';
  }
  if (assessmentStatus === 'needs-improvement') {
    return 'medium';
  }
  return 'low';
}

export function deriveEstimatedEffort(relatedFindingCount: number): RecommendationLevel {
  if (relatedFindingCount >= 4) {
    return 'high';
  }
  if (relatedFindingCount >= 2) {
    return 'medium';
  }
  return 'low';
}

export function deriveConfidence(): RecommendationLevel {
  // The Rule Engine only ever returns a definitive pass/fail outcome, never a
  // partial or uncertain one, so every Finding carries the same confidence today.
  return 'high';
}

export function computePriority(
  expectedImpact: RecommendationLevel,
  estimatedEffort: RecommendationLevel,
  confidence: RecommendationLevel,
): RecommendationPriority {
  const compositeScore =
    LEVEL_SCORE[expectedImpact] * 3 + LEVEL_SCORE[EFFORT_FAVORABILITY[estimatedEffort]] + LEVEL_SCORE[confidence];

  if (compositeScore >= HIGH_PRIORITY_THRESHOLD) {
    return 'high';
  }
  if (compositeScore >= MEDIUM_PRIORITY_THRESHOLD) {
    return 'medium';
  }
  return 'low';
}

export function sortByPriority<T extends { priority: RecommendationPriority }>(items: ReadonlyArray<T>): T[] {
  const rank: Record<RecommendationPriority, number> = { high: 2, medium: 1, low: 0 };
  return [...items].sort((a, b) => rank[b.priority] - rank[a.priority]);
}
