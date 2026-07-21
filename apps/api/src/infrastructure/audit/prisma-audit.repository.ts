import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { Audit, AuditStatus } from '../../domain/audit/audit.entity';
import { AuditRepository } from '../../domain/audit/audit.repository';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class PrismaAuditRepository implements AuditRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(url: string): Promise<Audit> {
    const record = await this.prisma.auditRequest.create({ data: { url } });
    return this.toDomain(record);
  }

  async markRunning(id: string, startedAt: Date): Promise<Audit> {
    const record = await this.prisma.auditRequest.update({
      where: { id },
      data: { status: 'running', startedAt },
    });
    return this.toDomain(record);
  }

  async markCompleted(id: string, completedAt: Date): Promise<Audit> {
    const record = await this.prisma.auditRequest.update({
      where: { id },
      data: { status: 'completed', completedAt },
    });
    return this.toDomain(record);
  }

  private toDomain(record: {
    id: string;
    url: string;
    status: string;
    createdAt: Date;
    startedAt: Date | null;
    completedAt: Date | null;
  }): Audit {
    return Audit.fromPersistence({
      id: record.id,
      url: record.url,
      status: record.status as AuditStatus,
      createdAt: record.createdAt,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
    });
  }
}
