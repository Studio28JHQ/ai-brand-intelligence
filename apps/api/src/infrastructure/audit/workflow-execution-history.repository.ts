import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { EngineExecutionStatus, WorkflowExecutionRecord } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class WorkflowExecutionHistoryRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async saveAll(auditId: string, records: WorkflowExecutionRecord[]): Promise<void> {
    if (records.length === 0) {
      return;
    }

    await this.prisma.workflowExecutionRecord.createMany({
      data: records.map((record) => ({
        id: randomUUID(),
        auditId,
        stepId: record.stepId,
        status: record.status,
        startedAt: new Date(record.startedAt),
        completedAt: new Date(record.completedAt),
        durationMs: record.durationMs,
        errorCode: record.errorCode ?? null,
        errorMessage: record.errorMessage ?? null,
      })),
    });
  }

  async findByAuditId(auditId: string): Promise<WorkflowExecutionRecord[]> {
    const records = await this.prisma.workflowExecutionRecord.findMany({
      where: { auditId },
      orderBy: { startedAt: 'asc' },
    });

    return records.map((record) => ({
      stepId: record.stepId,
      status: record.status as EngineExecutionStatus,
      startedAt: record.startedAt.toISOString(),
      completedAt: record.completedAt.toISOString(),
      durationMs: record.durationMs,
      errorCode: record.errorCode ?? undefined,
      errorMessage: record.errorMessage ?? undefined,
    }));
  }

  async findByAuditIds(auditIds: string[]): Promise<Map<string, WorkflowExecutionRecord[]>> {
    if (auditIds.length === 0) {
      return new Map();
    }

    const records = await this.prisma.workflowExecutionRecord.findMany({
      where: { auditId: { in: auditIds } },
      orderBy: { startedAt: 'asc' },
    });

    const byAuditId = new Map<string, WorkflowExecutionRecord[]>();
    for (const record of records) {
      const entry: WorkflowExecutionRecord = {
        stepId: record.stepId,
        status: record.status as EngineExecutionStatus,
        startedAt: record.startedAt.toISOString(),
        completedAt: record.completedAt.toISOString(),
        durationMs: record.durationMs,
        errorCode: record.errorCode ?? undefined,
        errorMessage: record.errorMessage ?? undefined,
      };

      const existing = byAuditId.get(record.auditId);
      if (existing) {
        existing.push(entry);
      } else {
        byAuditId.set(record.auditId, [entry]);
      }
    }

    return byAuditId;
  }
}
