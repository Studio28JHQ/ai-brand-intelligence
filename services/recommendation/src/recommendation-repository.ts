import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { Recommendation } from '@ai-visibility/contracts';

export async function saveRecommendations(recommendations: Recommendation[]): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  for (const recommendation of recommendations) {
    await prisma.recommendation.upsert({
      where: { id: recommendation.id },
      create: {
        id: recommendation.id,
        auditId: recommendation.auditId,
        title: recommendation.title,
        rationale: recommendation.rationale,
        priority: recommendation.priority,
        status: recommendation.status,
        relatedFindingIds: recommendation.relatedFindingIds,
      },
      update: {
        title: recommendation.title,
        rationale: recommendation.rationale,
        priority: recommendation.priority,
        status: recommendation.status,
        relatedFindingIds: recommendation.relatedFindingIds,
      },
    });
  }
}
