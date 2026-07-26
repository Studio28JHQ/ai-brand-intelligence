import type { AiVisibilityAssessment, Finding, Recommendation, RecommendationLevel } from '@ai-visibility/contracts';
import { computePriority, deriveConfidence, deriveEstimatedEffort, deriveExpectedImpact } from './recommendation-prioritization';

export interface RecommendationContext {
  projectId: string;
  auditId: string;
}

function buildRecommendation(
  context: RecommendationContext,
  finding: Finding,
  expectedImpact: RecommendationLevel,
  assessmentStatus: AiVisibilityAssessment['status'],
): Recommendation {
  const relatedFindingIds = [finding.id];
  const estimatedEffort = deriveEstimatedEffort(relatedFindingIds.length);
  const confidence = deriveConfidence();

  return {
    title: `Resolve ${finding.sourceEngine} execution issue`,
    description: `Rule '${finding.ruleId}' evaluated to '${finding.outcome}' for the ${finding.sourceEngine} engine (${finding.category}).`,
    rationale: `Addressing this improves AI Visibility signal completeness and moves the assessment away from '${assessmentStatus}'.`,
    expectedImpact,
    estimatedEffort,
    priority: computePriority(expectedImpact, estimatedEffort, confidence),
    status: 'open',
    relatedFindingIds,
    projectId: context.projectId,
    auditId: context.auditId,
  };
}

export function generateRecommendations(
  context: RecommendationContext,
  findings: ReadonlyArray<Finding>,
  assessment: AiVisibilityAssessment,
): Recommendation[] {
  const expectedImpact = deriveExpectedImpact(assessment.status);
  const actionableFindings = findings.filter((finding) => finding.severity !== 'none');

  const seenRuleIds = new Set<string>();
  const recommendations: Recommendation[] = [];

  for (const finding of actionableFindings) {
    if (seenRuleIds.has(finding.ruleId)) {
      continue;
    }
    seenRuleIds.add(finding.ruleId);
    recommendations.push(buildRecommendation(context, finding, expectedImpact, assessment.status));
  }

  return recommendations;
}
