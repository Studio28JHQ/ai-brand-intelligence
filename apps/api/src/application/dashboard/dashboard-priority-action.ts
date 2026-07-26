import type { DashboardPriorityAction, EffortLevel, Recommendation, RecommendationPriority } from '@ai-visibility/contracts';

const PRIORITY_RANK: Record<RecommendationPriority, number> = { high: 2, medium: 1, low: 0 };

const TOP_ACTIONS_LIMIT = 5;

function deriveExpectedImprovement(priority: RecommendationPriority): EffortLevel {
  return priority;
}

function deriveEstimatedEffort(relatedFindingCount: number): EffortLevel {
  if (relatedFindingCount >= 4) {
    return 'high';
  }
  if (relatedFindingCount >= 2) {
    return 'medium';
  }
  return 'low';
}

export function buildPriorityActions(recommendations: ReadonlyArray<Recommendation>): DashboardPriorityAction[] {
  return recommendations
    .map((recommendation) => ({
      title: recommendation.title,
      rationale: recommendation.rationale,
      priority: recommendation.priority,
      estimatedEffort: deriveEstimatedEffort(recommendation.relatedFindingIds.length),
      expectedImprovement: deriveExpectedImprovement(recommendation.priority),
      relatedFindingIds: recommendation.relatedFindingIds,
    }))
    .sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority])
    .slice(0, TOP_ACTIONS_LIMIT);
}
