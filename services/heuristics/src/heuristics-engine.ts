import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { AnalysisSignal, Heuristic, HeuristicResult, HeuristicScope } from '@ai-visibility/contracts';
import { COMBINATOR_REGISTRY } from './combinators/registry';
import { saveHeuristics } from './heuristics-repository';

export async function runHeuristics(
  auditId: string,
  signals: AnalysisSignal[],
  scope: HeuristicScope,
  correlationId: string,
): Promise<HeuristicResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'heuristics',
    data: { auditId, scope },
  });

  try {
    const heuristics: Heuristic[] = COMBINATOR_REGISTRY.map((combine) => combine(signals)).filter(
      (heuristic): heuristic is Heuristic => heuristic !== null,
    );

    await saveHeuristics(auditId, scope, heuristics);

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'heuristics',
      data: { auditId, scope },
    });

    return { heuristics };
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'heuristics',
      data: { auditId, scope, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
