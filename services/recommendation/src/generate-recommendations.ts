import type {
  AiVisibilityAssessment,
  Finding,
  Recommendation,
  RecommendationPriority,
} from '@ai-visibility/contracts';

function derivePriority(assessmentStatus: AiVisibilityAssessment['status']): RecommendationPriority {
  if (assessmentStatus === 'not-ready') {
    return 'high';
  }
  if (assessmentStatus === 'needs-improvement') {
    return 'medium';
  }
  return 'low';
}

function buildRecommendation(auditId: string, finding: Finding, priority: RecommendationPriority): Recommendation {
  return {
    id: `${auditId}:${finding.ruleId}`,
    auditId,
    title: `Resolve ${finding.sourceEngine} execution issue`,
    rationale: `Rule '${finding.ruleId}' evaluated to '${finding.outcome}' for engine '${finding.sourceEngine}'.`,
    priority,
    status: 'open',
    relatedFindingIds: [finding.id],
  };
}

export function generateRecommendations(
  auditId: string,
  findings: Finding[],
  assessment: AiVisibilityAssessment,
): Recommendation[] {
  const priority = derivePriority(assessment.status);
  const actionableFindings = findings.filter((finding) => finding.severity !== 'none');

  const byId = new Map<string, Recommendation>();
  for (const finding of actionableFindings) {
    const recommendation = buildRecommendation(auditId, finding, priority);
    if (!byId.has(recommendation.id)) {
      byId.set(recommendation.id, recommendation);
    }
  }

  return Array.from(byId.values());
}
