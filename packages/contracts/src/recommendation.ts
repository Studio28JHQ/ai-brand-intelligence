export type RecommendationPriority = 'low' | 'medium' | 'high';

export type RecommendationStatus = 'open';

export interface Recommendation {
  title: string;
  rationale: string;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  relatedFindingIds: string[];
}

export interface RecommendationSummary {
  recommendations: Recommendation[];
}
