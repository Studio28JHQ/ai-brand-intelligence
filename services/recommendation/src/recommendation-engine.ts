import type { AiVisibilityAssessment, Finding, RecommendationResult } from '@ai-visibility/contracts';
import { generateRecommendations } from './generate-recommendations';
import { saveRecommendations } from './recommendation-repository';

export async function runRecommendation(
  auditId: string,
  findings: Finding[],
  assessment: AiVisibilityAssessment,
): Promise<RecommendationResult> {
  const recommendations = generateRecommendations(auditId, findings, assessment);
  await saveRecommendations(recommendations);
  return { recommendations };
}
