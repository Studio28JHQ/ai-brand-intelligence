import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { Audit, AuditStatus } from '../../domain/audit/audit.entity';
import { AuditNotFoundError } from '../../domain/audit/audit.errors';
import { AuditRepository } from '../../domain/audit/audit.repository';
import { PRISMA_CLIENT } from '../database/database.module';

interface AuditRecord {
  id: string;
  url: string;
  status: string;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  cancelledAt: Date | null;
}

@Injectable()
export class PrismaAuditRepository implements AuditRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(url: string): Promise<Audit> {
    const record = await this.prisma.auditRequest.create({ data: { url } });
    return this.toDomain(record);
  }

  async markRunning(id: string, startedAt: Date): Promise<Audit> {
    const current = await this.findByIdOrThrow(id);
    const next = current.start(startedAt);
    return this.persist(next);
  }

  async markCompleted(id: string, completedAt: Date): Promise<Audit> {
    const current = await this.findByIdOrThrow(id);
    const next = current.complete(completedAt);
    return this.persist(next);
  }

  async markFailed(id: string, failedAt: Date): Promise<Audit> {
    const current = await this.findByIdOrThrow(id);
    const next = current.fail(failedAt);
    return this.persist(next);
  }

  async markCancelled(id: string, cancelledAt: Date): Promise<Audit> {
    const current = await this.findByIdOrThrow(id);
    const next = current.cancel(cancelledAt);
    return this.persist(next);
  }

  private async findByIdOrThrow(id: string): Promise<Audit> {
    const record = await this.prisma.auditRequest.findUnique({ where: { id } });
    if (!record) {
      throw new AuditNotFoundError(id);
    }
    return this.toDomain(record);
  }

  private async persist(audit: Audit): Promise<Audit> {
    const record = await this.prisma.auditRequest.update({
      where: { id: audit.id },
      data: {
        status: audit.status,
        startedAt: audit.startedAt,
        completedAt: audit.completedAt,
        failedAt: audit.failedAt,
        cancelledAt: audit.cancelledAt,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: AuditRecord): Audit {
    return Audit.fromPersistence({
      id: record.id,
      url: record.url,
      status: record.status as AuditStatus,
      createdAt: record.createdAt,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      failedAt: record.failedAt,
      cancelledAt: record.cancelledAt,
    });
  }
}
