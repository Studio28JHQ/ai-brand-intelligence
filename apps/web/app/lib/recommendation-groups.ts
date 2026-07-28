import type { BriefingItem, BriefingItemCategory } from '@ai-visibility/contracts';
import type { Translator } from '@ai-visibility/i18n';

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

const SECTION_LABEL_KEYS: Record<RecommendationSection, string> = {
  'high-priority-alerts': 'sectionHighPriorityAlerts',
  'risk-notifications': 'sectionRiskNotifications',
  'verification-reminders': 'sectionVerificationReminders',
  'optimization-opportunities': 'sectionOptimizationOpportunities',
  'daily-highlights': 'sectionDailyHighlights',
};

export function recommendationSectionLabel(section: RecommendationSection, t: Translator): string {
  return t(SECTION_LABEL_KEYS[section]);
}

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

export function buildExecutiveSummary(items: ReadonlyArray<BriefingItem>, projectName: string, t: Translator): string {
  if (items.length === 0) {
    return t('executiveSummaryNoOpen', { projectName });
  }

  const parts = groupRecommendationsBySection(items).map(
    (group) => `${group.items.length} ${recommendationSectionLabel(group.section, t).toLowerCase()}`,
  );

  return t('executiveSummaryHasOpen', {
    projectName,
    count: items.length,
    plural: items.length === 1 ? '' : 's',
    parts: parts.join(', '),
  });
}
