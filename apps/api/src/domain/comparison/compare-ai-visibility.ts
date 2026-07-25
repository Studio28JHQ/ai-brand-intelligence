import type { AiVisibilityAssessment, AiVisibilityComparison } from '@ai-visibility/contracts';

export function compareAiVisibility(
  baseline: AiVisibilityAssessment,
  target: AiVisibilityAssessment,
): AiVisibilityComparison {
  const baselineSignals = new Set(baseline.missingSignals);
  const targetSignals = new Set(target.missingSignals);

  return {
    baselineStatus: baseline.status,
    targetStatus: target.status,
    statusChanged: baseline.status !== target.status,
    baselineGraphCompleteness: baseline.graphCompleteness,
    targetGraphCompleteness: target.graphCompleteness,
    baselineEntityCoverage: baseline.entityCoverage,
    targetEntityCoverage: target.entityCoverage,
    baselineRelationshipCoverage: baseline.relationshipCoverage,
    targetRelationshipCoverage: target.relationshipCoverage,
    newMissingSignals: target.missingSignals.filter((signal) => !baselineSignals.has(signal)),
    resolvedMissingSignals: baseline.missingSignals.filter((signal) => !targetSignals.has(signal)),
  };
}
