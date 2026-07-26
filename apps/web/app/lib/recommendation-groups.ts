import type { BriefingItem, BriefingItemCategory } from '@ai-visibility/contracts';

export type RecommendationSection =
  | 'high-priority-alerts'
  | 'risk-notifications'
  | 'verification-reminders'
  | 'optimization-opportunities'
  | 'daily-highlights';

const SECTION_BY_CATEGORY: Record<BriefingItemCategory, RecommendationSection> = {
  'project-attention': 'high-priority-alerts',
  'critical-finding': 'high-priority-alerts',
  'ai-visibility-regression': 'risk-notifications',
  'campaign-awaiting-verification': 'verification-reminders',
  'high-impact-opportunity': 'optimization-opportunities',
  'recent-improvement': 'daily-highlights',
};

export const RECOMMENDATION_SECTION_LABELS: Record<RecommendationSection, string> = {
  'high-priority-alerts': 'High-Priority Alerts',
  'risk-notifications': 'Risk Notifications',
  'verification-reminders': 'Verification Reminders',
  'optimization-opportunities': 'Optimization Opportunities',
  'daily-highlights': 'Daily Highlights',
};

const SECTION_ORDER: RecommendationSection[] = [
  'high-priority-alerts',
  'risk-notifications',
  'verification-reminders',
  'optimization-opportunities',
  'daily-highlights',
];

/**
 * Regroups the same BriefingItems the AI Daily Briefing already computes (F7-S04) under the
 * proactive-assistant vocabulary (F10-S01). No new facts are derived — items keep the order the
 * Briefing already prioritized them in (`sortBriefingItems`), just relabeled and bucketed.
 */
export function groupRecommendationsBySection(
  items: ReadonlyArray<BriefingItem>,
): { section: RecommendationSection; items: BriefingItem[] }[] {
  return SECTION_ORDER.map((section) => ({
    section,
    items: items.filter((item) => SECTION_BY_CATEGORY[item.category] === section),
  })).filter((group) => group.items.length > 0);
}

export function buildExecutiveSummary(items: ReadonlyArray<BriefingItem>, projectName: string): string {
  if (items.length === 0) {
    return `No open recommendations for ${projectName} right now — everything reviewed is on track.`;
  }

  const parts = groupRecommendationsBySection(items).map(
    (group) => `${group.items.length} ${RECOMMENDATION_SECTION_LABELS[group.section].toLowerCase()}`,
  );

  return `${projectName} has ${items.length} open recommendation${items.length === 1 ? '' : 's'}: ${parts.join(', ')}.`;
}
