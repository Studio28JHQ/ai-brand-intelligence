export type RecommendationLevel = 'low' | 'medium' | 'high';

export type RecommendationPriority = RecommendationLevel;

export type RecommendationStatus = 'open';

export interface Recommendation {
  title: string;
  description: string;
  rationale: string;
  expectedImpact: RecommendationLevel;
  estimatedEffort: RecommendationLevel;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  relatedFindingIds: string[];
  projectId: string;
  auditId: string;
}

export interface RecommendationSummary {
  recommendations: Recommendation[];
}
