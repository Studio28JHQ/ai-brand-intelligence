import type { AiVisibilityAssessment, Finding, Recommendation, RecommendationPriority } from '@ai-visibility/contracts';

function derivePriority(assessmentStatus: AiVisibilityAssessment['status']): RecommendationPriority {
  if (assessmentStatus === 'not-ready') {
    return 'high';
  }
  if (assessmentStatus === 'needs-improvement') {
    return 'medium';
  }
  return 'low';
}

function buildRecommendation(finding: Finding, priority: RecommendationPriority): Recommendation {
  return {
    title: `Resolve ${finding.sourceEngine} execution issue`,
    rationale: `Rule '${finding.ruleId}' evaluated to '${finding.outcome}' for engine '${finding.sourceEngine}'.`,
    priority,
    status: 'open',
    relatedFindingIds: [finding.id],
  };
}

export function generateRecommendations(findings: Finding[], assessment: AiVisibilityAssessment): Recommendation[] {
  const priority = derivePriority(assessment.status);
  const actionableFindings = findings.filter((finding) => finding.severity !== 'none');

  const seenRuleIds = new Set<string>();
  const recommendations: Recommendation[] = [];

  for (const finding of actionableFindings) {
    if (seenRuleIds.has(finding.ruleId)) {
      continue;
    }
    seenRuleIds.add(finding.ruleId);
    recommendations.push(buildRecommendation(finding, priority));
  }

  return recommendations;
}
