export type RecommendationPriority = 'low' | 'medium' | 'high';

export type RecommendationStatus = 'open';

export interface Recommendation {
  id: string;
  auditId: string;
  title: string;
  rationale: string;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  relatedFindingIds: string[];
}

export interface RecommendationResult {
  recommendations: Recommendation[];
}

export interface RecommendationItemSummary {
  title: string;
  rationale: string;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  relatedFindingIds: string[];
}

export interface RecommendationSummary {
  recommendations: RecommendationItemSummary[];
}
