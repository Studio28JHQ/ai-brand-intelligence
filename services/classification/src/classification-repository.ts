import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { FindingClassification } from '@ai-visibility/contracts';

export async function saveClassifications(classifications: FindingClassification[]): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  for (const classification of classifications) {
    await prisma.findingClassification.upsert({
      where: { id: classification.id },
      create: {
        id: classification.id,
        findingId: classification.findingId,
        auditId: classification.auditId,
        classification: classification.classification,
        rationale: classification.rationale,
      },
      update: {
        classification: classification.classification,
        rationale: classification.rationale,
      },
    });
  }
}
