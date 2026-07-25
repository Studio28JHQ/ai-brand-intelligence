import type { ClassificationResult, Finding } from '@ai-visibility/contracts';
import { evaluateClassifications } from './evaluate-classifications';
import { saveClassifications } from './classification-repository';

export async function runClassification(auditId: string, findings: Finding[]): Promise<ClassificationResult> {
  const classifications = evaluateClassifications(auditId, findings);
  await saveClassifications(classifications);
  return { classifications };
}
