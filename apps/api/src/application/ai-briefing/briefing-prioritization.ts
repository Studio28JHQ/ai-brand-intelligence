import type { BriefingItem, BriefingItemCategory, OptimizationLevel } from '@ai-visibility/contracts';

const CATEGORY_RANK: Record<BriefingItemCategory, number> = {
  'project-attention': 6,
  'ai-visibility-regression': 5,
  'critical-finding': 4,
  'campaign-awaiting-verification': 3,
  'high-impact-opportunity': 2,
  'recent-improvement': 1,
};

const CONFIDENCE_RANK: Record<OptimizationLevel, number> = { high: 2, medium: 1, low: 0 };

export function sortBriefingItems(items: ReadonlyArray<BriefingItem>): BriefingItem[] {
  return [...items].sort((a, b) => {
    const categoryDelta = CATEGORY_RANK[b.category] - CATEGORY_RANK[a.category];
    if (categoryDelta !== 0) {
      return categoryDelta;
    }
    return CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence];
  });
}
