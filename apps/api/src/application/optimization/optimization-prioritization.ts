import type { OptimizationLevel, OptimizationPriority } from '@ai-visibility/contracts';

const LEVEL_SCORE: Record<OptimizationLevel, number> = { low: 1, medium: 2, high: 3 };

const EFFORT_FAVORABILITY: Record<OptimizationLevel, OptimizationLevel> = {
  low: 'high',
  medium: 'medium',
  high: 'low',
};

const HIGH_PRIORITY_THRESHOLD = 14;
const MEDIUM_PRIORITY_THRESHOLD = 10;

// The order the Workflow Runtime always executes Business Engines in. An
// Optimization Item tied to an earlier stage genuinely blocks Items tied to
// later stages — later stages depend on earlier ones having run successfully.
const PIPELINE_ORDER = ['discovery', 'crawl', 'inventory', 'analysis', 'entity', 'knowledgeGraph', 'aiVisibility'];

function pipelineRank(sourceEngine: string): number {
  const index = PIPELINE_ORDER.indexOf(sourceEngine);
  return index === -1 ? PIPELINE_ORDER.length : index;
}

export function deriveExpectedImpact(assessmentStatus: 'ready' | 'needs-improvement' | 'not-ready'): OptimizationLevel {
  if (assessmentStatus === 'not-ready') {
    return 'high';
  }
  if (assessmentStatus === 'needs-improvement') {
    return 'medium';
  }
  return 'low';
}

export function deriveEstimatedEffort(supportingFindingCount: number): OptimizationLevel {
  if (supportingFindingCount >= 4) {
    return 'high';
  }
  if (supportingFindingCount >= 2) {
    return 'medium';
  }
  return 'low';
}

export function deriveConfidence(): OptimizationLevel {
  // The Rule Engine only ever returns a definitive pass/fail outcome, never a
  // partial or uncertain one, so every Finding carries the same confidence today.
  return 'high';
}

export function countBlockedItems(sourceEngine: string, allSourceEngines: ReadonlyArray<string>): number {
  const rank = pipelineRank(sourceEngine);
  return allSourceEngines.filter((engine) => pipelineRank(engine) > rank).length;
}

export function deriveDependencyWeight(blockedItemCount: number): OptimizationLevel {
  if (blockedItemCount >= 3) {
    return 'high';
  }
  if (blockedItemCount >= 1) {
    return 'medium';
  }
  return 'low';
}

export function computePriority(
  expectedImpact: OptimizationLevel,
  estimatedEffort: OptimizationLevel,
  confidence: OptimizationLevel,
  dependencyWeight: OptimizationLevel,
): OptimizationPriority {
  const compositeScore =
    LEVEL_SCORE[expectedImpact] * 3 +
    LEVEL_SCORE[EFFORT_FAVORABILITY[estimatedEffort]] +
    LEVEL_SCORE[confidence] +
    LEVEL_SCORE[dependencyWeight];

  if (compositeScore >= HIGH_PRIORITY_THRESHOLD) {
    return 'high';
  }
  if (compositeScore >= MEDIUM_PRIORITY_THRESHOLD) {
    return 'medium';
  }
  return 'low';
}

export function sortByPriority<T extends { priority: OptimizationPriority }>(items: ReadonlyArray<T>): T[] {
  const rank: Record<OptimizationPriority, number> = { high: 2, medium: 1, low: 0 };
  return [...items].sort((a, b) => rank[b.priority] - rank[a.priority]);
}
