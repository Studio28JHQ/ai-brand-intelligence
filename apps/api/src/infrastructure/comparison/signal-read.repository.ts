import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { AnalysisSignal } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class SignalReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findByAuditId(auditId: string): Promise<AnalysisSignal[]> {
    const records = await this.prisma.signal.findMany({ where: { auditId } });
    return records.map((record) => ({
      signalId: record.id,
      key: record.key,
      category: record.category as AnalysisSignal['category'],
      data: record.data as Record<string, unknown>,
      sourceType: record.sourceType as AnalysisSignal['sourceType'],
      sourceId: record.sourceId,
      confidence: record.confidence,
      timestamp: record.timestamp.toISOString(),
      fingerprint: record.fingerprint,
    }));
  }
}
