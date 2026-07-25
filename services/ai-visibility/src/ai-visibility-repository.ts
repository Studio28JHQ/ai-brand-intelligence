import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { AiVisibilityAssessment } from '@ai-visibility/contracts';

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
