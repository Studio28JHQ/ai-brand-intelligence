import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { Entity } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class EntityReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findByAuditId(auditId: string): Promise<Entity[]> {
    const records = await this.prisma.entity.findMany({ where: { auditId } });
    return records.map((record) => ({
      id: record.id,
      auditId: record.auditId,
      name: record.name,
      type: record.type as Entity['type'],
      sourceLocation: record.sourceLocation as Entity['sourceLocation'],
      confidence: record.confidence,
    }));
  }
}
