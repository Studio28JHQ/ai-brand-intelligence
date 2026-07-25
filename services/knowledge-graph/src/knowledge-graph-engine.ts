import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { Entity, KnowledgeGraphResult } from '@ai-visibility/contracts';
import { buildGraph } from './build-graph';
import { saveGraph } from './knowledge-graph-repository';

export async function runKnowledgeGraph(
  auditId: string,
  entities: Entity[],
  correlationId: string,
): Promise<KnowledgeGraphResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'knowledge-graph',
    data: { auditId },
  });

  try {
    const { nodes, relationships } = buildGraph(auditId, entities);
    await saveGraph(nodes, relationships);

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'knowledge-graph',
      data: { auditId },
    });

    return { nodes, relationships };
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'knowledge-graph',
      data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
