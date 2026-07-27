import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { AnalysisSignal, CrawlResult, DiscoveryResult, ExtractionResult, InventoryResult } from '@ai-visibility/contracts';
import { ANALYZER_REGISTRY } from './analyzers/registry';
import { saveSignals } from './extraction-repository';

export async function runExtraction(
  auditId: string,
  crawlResult: CrawlResult,
  discoveryResult: DiscoveryResult,
  inventoryResult: InventoryResult,
  correlationId: string,
): Promise<ExtractionResult> {
  emitTelemetryEvent({
    name: 'engine.started',
    category: 'engine',
    severity: 'info',
    correlationId,
    source: 'extraction',
    data: { auditId },
  });

  try {
    const input = { crawlResult, discoveryResult, inventoryResult };
    const signals: AnalysisSignal[] = ANALYZER_REGISTRY.flatMap((analyzer) => analyzer.analyze(input));

    await saveSignals(auditId, signals);

    emitTelemetryEvent({
      name: 'engine.completed',
      category: 'engine',
      severity: 'info',
      correlationId,
      source: 'extraction',
      data: { auditId },
    });

    return { signals };
  } catch (error) {
    emitTelemetryEvent({
      name: 'engine.failed',
      category: 'engine',
      severity: 'error',
      correlationId,
      source: 'extraction',
      data: { auditId, errorMessage: error instanceof Error ? error.message : String(error) },
    });
    throw error;
  }
}
