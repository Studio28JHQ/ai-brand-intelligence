import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { AiVisibilityAssessment, AnalysisSignal } from '@ai-visibility/contracts';

export async function saveAssessment(assessment: AiVisibilityAssessment): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  await prisma.aiVisibilityAssessment.upsert({
    where: { auditId: assessment.auditId },
    create: {
      auditId: assessment.auditId,
      status: assessment.status,
      graphCompleteness: assessment.graphCompleteness,
      entityCoverage: assessment.entityCoverage,
      relationshipCoverage: assessment.relationshipCoverage,
      missingSignals: assessment.missingSignals,
      assessedAt: new Date(assessment.assessedAt),
    },
    update: {
      status: assessment.status,
      graphCompleteness: assessment.graphCompleteness,
      entityCoverage: assessment.entityCoverage,
      relationshipCoverage: assessment.relationshipCoverage,
      missingSignals: assessment.missingSignals,
      assessedAt: new Date(assessment.assessedAt),
    },
  });
}

// Signals are immutable and append-only (see @ai-visibility/extraction-engine's identical
// convention) — insert-only, no update/upsert path.
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
