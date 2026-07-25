import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { AiVisibilityResult, KnowledgeGraphResult } from '@ai-visibility/contracts';
import { evaluateVisibility } from './evaluate-visibility';
import { saveAssessment } from './ai-visibility-repository';

export async function runAiVisibilityAssessment(
  auditId: string,
  graph: KnowledgeGraphResult,
  correlationId: string,
): Promise<AiVisibilityResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'ai-visibility',
    data: { auditId },
  });

  try {
    const assessment = evaluateVisibility(auditId, graph);
    await saveAssessment(assessment);

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'ai-visibility',
      data: { auditId },
    });

    return { assessment };
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'ai-visibility',
      data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
