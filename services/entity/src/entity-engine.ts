import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { EntityResult, InventoryResult } from '@ai-visibility/contracts';
import { extractEntities } from './extract-entities';
import { saveEntities } from './entity-repository';

export async function runEntityExtraction(
  auditId: string,
  inventory: InventoryResult,
  correlationId: string,
): Promise<EntityResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'entity',
    data: { auditId },
  });

  try {
    const entities = extractEntities(auditId, inventory);
    await saveEntities(entities);

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'entity',
      data: { auditId },
    });

    return { entities };
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'entity',
      data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
