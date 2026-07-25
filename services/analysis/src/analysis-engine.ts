import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { AnalysisResult, WorkflowResult } from '@ai-visibility/contracts';
import { evaluateFindings } from './evaluate-findings';
import { saveFindings } from './analysis-repository';

export async function runAnalysis(
  auditId: string,
  workflowResult: WorkflowResult,
  correlationId: string,
): Promise<AnalysisResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'analysis',
    data: { auditId },
  });

  try {
    const { findings, ruleSetVersion } = evaluateFindings(auditId, workflowResult);
    await saveFindings(findings);

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'analysis',
      data: { auditId },
    });

    return { findings, ruleSetVersion };
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'analysis',
      data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
