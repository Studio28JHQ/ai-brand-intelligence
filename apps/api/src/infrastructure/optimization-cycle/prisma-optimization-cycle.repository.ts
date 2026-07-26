import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { CycleStatus } from '@ai-visibility/contracts';
import { OptimizationCycle } from '../../domain/optimization-cycle/optimization-cycle.entity';
import { OptimizationCycleRepository } from '../../domain/optimization-cycle/optimization-cycle.repository';
import { OptimizationCycleNotFoundError } from '../../domain/optimization-cycle/optimization-cycle.errors';
import { PRISMA_CLIENT } from '../database/database.module';

interface OptimizationCycleRecord {
  id: string;
  projectId: string;
  goal: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}

@Injectable()
export class PrismaOptimizationCycleRepository implements OptimizationCycleRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(projectId: string, goal: string): Promise<OptimizationCycle> {
    const record = await this.prisma.optimizationCycle.create({ data: { projectId, goal } });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<OptimizationCycle | null> {
    const record = await this.prisma.optimizationCycle.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findLatestByProjectId(projectId: string): Promise<OptimizationCycle | null> {
    const record = await this.prisma.optimizationCycle.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async start(id: string, startedAt: Date): Promise<OptimizationCycle> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.start(startedAt));
  }

  async beginVerification(id: string): Promise<OptimizationCycle> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.beginVerification());
  }

  async complete(id: string, completedAt: Date): Promise<OptimizationCycle> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.complete(completedAt));
  }

  private async findByIdOrThrow(id: string): Promise<OptimizationCycle> {
    const record = await this.prisma.optimizationCycle.findUnique({ where: { id } });
    if (!record) {
      throw new OptimizationCycleNotFoundError(id);
    }
    return this.toDomain(record);
  }

  private async persist(cycle: OptimizationCycle): Promise<OptimizationCycle> {
    const record = await this.prisma.optimizationCycle.update({
      where: { id: cycle.id },
      data: {
        status: cycle.status,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: OptimizationCycleRecord): OptimizationCycle {
    return OptimizationCycle.fromPersistence({
      id: record.id,
      projectId: record.projectId,
      goal: record.goal,
      status: record.status as CycleStatus,
      startDate: record.startDate,
      endDate: record.endDate,
      createdAt: record.createdAt,
    });
  }
}
