import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { OptimizationLevel, PatternStatus } from '@ai-visibility/contracts';
import {
  OptimizationPattern,
  computeConfidence,
  computeStatus,
} from '../../domain/optimization-pattern/optimization-pattern.entity';
import { OptimizationPatternRepository } from '../../domain/optimization-pattern/optimization-pattern.repository';
import { OptimizationPatternNotFoundError } from '../../domain/optimization-pattern/optimization-pattern.errors';
import { PRISMA_CLIENT } from '../database/database.module';

interface OptimizationPatternRecord {
  id: string;
  optimizationRuleId: string;
  category: string;
  occurrenceCount: number;
  distinctProjectCount: number;
  confidence: string;
  status: string;
  discoveredAt: Date;
  lastRecomputedAt: Date;
  invalidatedAt: Date | null;
}

@Injectable()
export class PrismaOptimizationPatternRepository implements OptimizationPatternRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<OptimizationPattern | null> {
    const record = await this.prisma.optimizationPattern.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByRuleId(optimizationRuleId: string): Promise<OptimizationPattern | null> {
    const record = await this.prisma.optimizationPattern.findUnique({ where: { optimizationRuleId } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<OptimizationPattern[]> {
    const records = await this.prisma.optimizationPattern.findMany({ orderBy: { optimizationRuleId: 'asc' } });
    return records.map((record) => this.toDomain(record));
  }

  async findAllActive(): Promise<OptimizationPattern[]> {
    const records = await this.prisma.optimizationPattern.findMany({
      where: { status: 'active' },
      orderBy: { optimizationRuleId: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async create(
    optimizationRuleId: string,
    category: string,
    occurrenceCount: number,
    distinctProjectCount: number,
    now: Date,
  ): Promise<OptimizationPattern> {
    const record = await this.prisma.optimizationPattern.create({
      data: {
        optimizationRuleId,
        category,
        occurrenceCount,
        distinctProjectCount,
        confidence: computeConfidence(distinctProjectCount),
        status: computeStatus(distinctProjectCount),
        discoveredAt: now,
        lastRecomputedAt: now,
      },
    });
    return this.toDomain(record);
  }

  async recompute(id: string, occurrenceCount: number, distinctProjectCount: number, now: Date): Promise<OptimizationPattern> {
    const current = await this.findByIdOrThrow(id);
    const recomputed = current.recompute(occurrenceCount, distinctProjectCount, now);
    return this.persist(recomputed);
  }

  async invalidate(id: string, now: Date): Promise<OptimizationPattern> {
    const current = await this.findByIdOrThrow(id);
    const invalidated = current.invalidate(now);
    return this.persist(invalidated);
  }

  private async findByIdOrThrow(id: string): Promise<OptimizationPattern> {
    const record = await this.prisma.optimizationPattern.findUnique({ where: { id } });
    if (!record) {
      throw new OptimizationPatternNotFoundError(id);
    }
    return this.toDomain(record);
  }

  private async persist(pattern: OptimizationPattern): Promise<OptimizationPattern> {
    const record = await this.prisma.optimizationPattern.update({
      where: { id: pattern.id },
      data: {
        occurrenceCount: pattern.occurrenceCount,
        distinctProjectCount: pattern.distinctProjectCount,
        confidence: pattern.confidence,
        status: pattern.status,
        lastRecomputedAt: pattern.lastRecomputedAt,
        invalidatedAt: pattern.invalidatedAt,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: OptimizationPatternRecord): OptimizationPattern {
    return OptimizationPattern.fromPersistence({
      id: record.id,
      optimizationRuleId: record.optimizationRuleId,
      category: record.category,
      occurrenceCount: record.occurrenceCount,
      distinctProjectCount: record.distinctProjectCount,
      confidence: record.confidence as OptimizationLevel,
      status: record.status as PatternStatus,
      discoveredAt: record.discoveredAt,
      lastRecomputedAt: record.lastRecomputedAt,
      invalidatedAt: record.invalidatedAt,
    });
  }
}
