import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { AnalysisSignal } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class SignalReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findByAuditId(auditId: string): Promise<AnalysisSignal[]> {
    const records = await this.prisma.signal.findMany({ where: { auditId } });
    return records.map((record) => this.toDomain(record));
  }

  async findByAuditIds(auditIds: string[]): Promise<Map<string, AnalysisSignal[]>> {
    if (auditIds.length === 0) {
      return new Map();
    }

    const records = await this.prisma.signal.findMany({ where: { auditId: { in: auditIds } } });
    const byAuditId = new Map<string, AnalysisSignal[]>();
    for (const record of records) {
      const entry = this.toDomain(record);
      const existing = byAuditId.get(record.auditId);
      if (existing) {
        existing.push(entry);
      } else {
        byAuditId.set(record.auditId, [entry]);
      }
    }
    return byAuditId;
  }

  private toDomain(record: {
    id: string;
    key: string;
    category: string;
    data: unknown;
    sourceType: string;
    sourceId: string;
    confidence: number;
    timestamp: Date;
    fingerprint: string;
  }): AnalysisSignal {
    return {
      signalId: record.id,
      key: record.key,
      category: record.category as AnalysisSignal['category'],
      data: record.data as Record<string, unknown>,
      sourceType: record.sourceType as AnalysisSignal['sourceType'],
      sourceId: record.sourceId,
      confidence: record.confidence,
      timestamp: record.timestamp.toISOString(),
      fingerprint: record.fingerprint,
    };
  }
}
