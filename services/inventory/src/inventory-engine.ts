import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { InventoryResult } from '@ai-visibility/contracts';
import { extractInventory } from './extract-inventory';
import { saveInventoryResult } from './inventory-repository';

export async function runInventory(
  auditId: string,
  html: string,
  pageUrl: string,
  correlationId: string,
): Promise<InventoryResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'inventory',
    data: { auditId },
  });

  try {
    const result = extractInventory(html, pageUrl);
    await saveInventoryResult(auditId, result);

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'inventory',
      data: { auditId },
    });

    return result;
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'inventory',
      data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
