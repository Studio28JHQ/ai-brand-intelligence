import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { OptimizationActionStatus } from '@ai-visibility/contracts';
import { OptimizationAction } from '../../domain/campaign/optimization-action.entity';
import { OptimizationActionRepository } from '../../domain/campaign/optimization-action.repository';
import { OptimizationActionNotFoundError } from '../../domain/campaign/campaign.errors';
import { PRISMA_CLIENT } from '../database/database.module';

interface OptimizationActionRecord {
  id: string;
  campaignId: string;
  projectId: string;
  auditId: string;
  optimizationRuleId: string;
  optimizationRuleVersion: string;
  supportingFindingIds: unknown;
  status: string;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  verifiedAt: Date | null;
}

@Injectable()
export class PrismaOptimizationActionRepository implements OptimizationActionRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<OptimizationAction | null> {
    const record = await this.prisma.optimizationAction.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByCampaignId(campaignId: string): Promise<OptimizationAction[]> {
    const records = await this.prisma.optimizationAction.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async start(id: string, startedAt: Date): Promise<OptimizationAction> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.start(startedAt));
  }

  async complete(id: string, completedAt: Date): Promise<OptimizationAction> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.complete(completedAt));
  }

  async verify(id: string, verifiedAt: Date): Promise<OptimizationAction> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.verify(verifiedAt));
  }

  private async findByIdOrThrow(id: string): Promise<OptimizationAction> {
    const record = await this.prisma.optimizationAction.findUnique({ where: { id } });
    if (!record) {
      throw new OptimizationActionNotFoundError(id);
    }
    return this.toDomain(record);
  }

  private async persist(action: OptimizationAction): Promise<OptimizationAction> {
    const record = await this.prisma.optimizationAction.update({
      where: { id: action.id },
      data: {
        status: action.status,
        startedAt: action.startedAt,
        completedAt: action.completedAt,
        verifiedAt: action.verifiedAt,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: OptimizationActionRecord): OptimizationAction {
    return OptimizationAction.fromPersistence({
      id: record.id,
      campaignId: record.campaignId,
      projectId: record.projectId,
      auditId: record.auditId,
      optimizationRuleId: record.optimizationRuleId,
      optimizationRuleVersion: record.optimizationRuleVersion,
      supportingFindingIds: record.supportingFindingIds as string[],
      status: record.status as OptimizationActionStatus,
      createdAt: record.createdAt,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      verifiedAt: record.verifiedAt,
    });
  }
}
