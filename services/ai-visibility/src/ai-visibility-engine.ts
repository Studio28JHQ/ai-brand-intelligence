import type { AiVisibilityResult, KnowledgeGraphResult } from '@ai-visibility/contracts';
import { evaluateVisibility } from './evaluate-visibility';
import { saveAssessment } from './ai-visibility-repository';

export async function runAiVisibilityAssessment(
  auditId: string,
  graph: KnowledgeGraphResult,
): Promise<AiVisibilityResult> {
  const assessment = evaluateVisibility(auditId, graph);
  await saveAssessment(assessment);
  return { assessment };
}
