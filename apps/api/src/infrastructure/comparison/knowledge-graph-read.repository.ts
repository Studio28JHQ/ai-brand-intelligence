import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { KnowledgeGraphResult } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class KnowledgeGraphReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findByAuditId(auditId: string): Promise<KnowledgeGraphResult> {
    const [nodes, relationships] = await Promise.all([
      this.prisma.graphNode.findMany({ where: { auditId } }),
      this.prisma.graphRelationship.findMany({ where: { auditId } }),
    ]);

    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        auditId: node.auditId,
        entityId: node.entityId,
        name: node.name,
        type: node.type,
      })),
      relationships: relationships.map((relationship) => ({
        id: relationship.id,
        auditId: relationship.auditId,
        type: relationship.type,
        sourceNodeId: relationship.sourceNodeId,
        targetNodeId: relationship.targetNodeId,
      })),
    };
  }
}
