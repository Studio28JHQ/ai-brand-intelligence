import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { GraphNode, GraphRelationship } from '@ai-visibility/contracts';

export async function saveGraph(nodes: GraphNode[], relationships: GraphRelationship[]): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  for (const node of nodes) {
    await prisma.graphNode.upsert({
      where: { id: node.id },
      create: {
        id: node.id,
        auditId: node.auditId,
        entityId: node.entityId,
        name: node.name,
        type: node.type,
      },
      update: {
        entityId: node.entityId,
        name: node.name,
        type: node.type,
      },
    });
  }

  for (const relationship of relationships) {
    await prisma.graphRelationship.upsert({
      where: { id: relationship.id },
      create: {
        id: relationship.id,
        auditId: relationship.auditId,
        type: relationship.type,
        sourceNodeId: relationship.sourceNodeId,
        targetNodeId: relationship.targetNodeId,
      },
      update: {
        type: relationship.type,
        sourceNodeId: relationship.sourceNodeId,
        targetNodeId: relationship.targetNodeId,
      },
    });
  }
}
