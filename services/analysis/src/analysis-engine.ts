import type { AnalysisResult, WorkflowResult } from '@ai-visibility/contracts';
import { evaluateFindings } from './evaluate-findings';
import { saveFindings } from './analysis-repository';

export async function runAnalysis(auditId: string, workflowResult: WorkflowResult): Promise<AnalysisResult> {
  const findings = evaluateFindings(auditId, workflowResult);
  await saveFindings(findings);
  return { findings };
}
