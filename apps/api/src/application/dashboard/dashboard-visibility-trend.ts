import type { VisibilityScoreTrend, VisibilityStatus } from '@ai-visibility/contracts';

const SCORE_RANK: Record<VisibilityStatus, number> = {
  'not-ready': 0,
  'needs-improvement': 1,
  ready: 2,
};

export function computeScoreTrend(
  currentScore: VisibilityStatus | null,
  baselineScore: VisibilityStatus | null,
): VisibilityScoreTrend {
  if (!currentScore || !baselineScore) {
    return 'unknown';
  }
  if (SCORE_RANK[currentScore] > SCORE_RANK[baselineScore]) {
    return 'improved';
  }
  if (SCORE_RANK[currentScore] < SCORE_RANK[baselineScore]) {
    return 'declined';
  }
  return 'unchanged';
}
