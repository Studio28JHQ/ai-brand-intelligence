import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { AnalysisSignal } from '@ai-visibility/contracts';

// Signals are immutable and append-only: this repository only ever inserts new rows for a
// given auditId. There is no update/upsert path — a Signal, once persisted, is never modified.
export async function saveSignals(auditId: string, signals: AnalysisSignal[]): Promise<void> {
  if (signals.length === 0) {
    return;
  }

  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  await prisma.signal.createMany({
    data: signals.map((signal) => ({
      id: signal.signalId,
      auditId,
      key: signal.key,
      category: signal.category,
      data: signal.data as object,
      sourceType: signal.sourceType,
      sourceId: signal.sourceId,
      confidence: signal.confidence,
      timestamp: new Date(signal.timestamp),
      fingerprint: signal.fingerprint,
    })),
  });
}
