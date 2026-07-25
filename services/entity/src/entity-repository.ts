import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { Entity } from '@ai-visibility/contracts';

export async function saveEntities(entities: Entity[]): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  for (const entity of entities) {
    await prisma.entity.upsert({
      where: { id: entity.id },
      create: {
        id: entity.id,
        auditId: entity.auditId,
        name: entity.name,
        type: entity.type,
        sourceLocation: entity.sourceLocation,
        confidence: entity.confidence,
      },
      update: {
        name: entity.name,
        type: entity.type,
        sourceLocation: entity.sourceLocation,
        confidence: entity.confidence,
      },
    });
  }
}
