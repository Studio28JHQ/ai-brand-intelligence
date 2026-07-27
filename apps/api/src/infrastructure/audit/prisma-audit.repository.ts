import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { Audit, AuditStatus } from '../../domain/audit/audit.entity';
import { AuditNotFoundError, DuplicateAuditExecutionError } from '../../domain/audit/audit.errors';
import { AuditRepository } from '../../domain/audit/audit.repository';
import { PRISMA_CLIENT } from '../database/database.module';

// Prisma maps a raw Postgres unique-violation (SQLSTATE 23505) to this shape even for indexes it
// doesn't know about from schema.prisma — the partial unique index this guards
// (`audit_requests_one_in_flight_per_project`, migration 20260727225907) is exactly that case,
// verified live against a real conflicting insert before relying on it here.
function isUniqueConstraintViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'P2002';
}

interface AuditRecord {
  id: string;
  projectId: string;
  cycleId: string;
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

  async create(projectId: string, url: string, cycleId: string): Promise<Audit> {
    try {
      const record = await this.prisma.auditRequest.create({ data: { projectId, url, cycleId } });
      return this.toDomain(record);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        // The application-level check in CreateAuditUseCase already tries to catch this earlier
        // and with a friendlier error (naming the actual in-flight Audit); this is the
        // database-enforced backstop for the narrow window where two requests both pass that
        // check before either has persisted its own row — same real Error type either way.
        throw new DuplicateAuditExecutionError(projectId, null);
      }
      throw error;
    }
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

  async findById(id: string): Promise<Audit | null> {
    const record = await this.prisma.auditRequest.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Audit[]> {
    const records = await this.prisma.auditRequest.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map((record) => this.toDomain(record));
  }

  async findLatest(): Promise<Audit | null> {
    const record = await this.prisma.auditRequest.findFirst({ orderBy: { createdAt: 'desc' } });
    return record ? this.toDomain(record) : null;
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
      projectId: record.projectId,
      cycleId: record.cycleId,
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
