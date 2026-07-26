import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { CampaignStatus } from '@ai-visibility/contracts';
import { Campaign } from '../../domain/campaign/campaign.entity';
import { CampaignRepository, NewActionSeed } from '../../domain/campaign/campaign.repository';
import { CampaignNotFoundError } from '../../domain/campaign/campaign.errors';
import { PRISMA_CLIENT } from '../database/database.module';

interface CampaignRecord {
  id: string;
  projectId: string;
  cycleId: string;
  sourceAuditId: string;
  status: string;
  createdAt: Date;
  activatedAt: Date | null;
  completedAt: Date | null;
  archivedAt: Date | null;
}

@Injectable()
export class PrismaCampaignRepository implements CampaignRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(projectId: string, sourceAuditId: string, cycleId: string, actionSeeds: NewActionSeed[]): Promise<Campaign> {
    const record = await this.prisma.optimizationCampaign.create({
      data: {
        projectId,
        cycleId,
        sourceAuditId,
        actions: {
          create: actionSeeds.map((seed) => ({
            projectId,
            auditId: sourceAuditId,
            title: seed.title,
            supportingFindingIds: seed.supportingFindingIds,
          })),
        },
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<Campaign | null> {
    const record = await this.prisma.optimizationCampaign.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findLatestByProjectId(projectId: string): Promise<Campaign | null> {
    const record = await this.prisma.optimizationCampaign.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async activate(id: string, activatedAt: Date): Promise<Campaign> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.activate(activatedAt));
  }

  async complete(id: string, completedAt: Date): Promise<Campaign> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.complete(completedAt));
  }

  async archive(id: string, archivedAt: Date): Promise<Campaign> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.archive(archivedAt));
  }

  private async findByIdOrThrow(id: string): Promise<Campaign> {
    const record = await this.prisma.optimizationCampaign.findUnique({ where: { id } });
    if (!record) {
      throw new CampaignNotFoundError(id);
    }
    return this.toDomain(record);
  }

  private async persist(campaign: Campaign): Promise<Campaign> {
    const record = await this.prisma.optimizationCampaign.update({
      where: { id: campaign.id },
      data: {
        status: campaign.status,
        activatedAt: campaign.activatedAt,
        completedAt: campaign.completedAt,
        archivedAt: campaign.archivedAt,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: CampaignRecord): Campaign {
    return Campaign.fromPersistence({
      id: record.id,
      projectId: record.projectId,
      cycleId: record.cycleId,
      sourceAuditId: record.sourceAuditId,
      status: record.status as CampaignStatus,
      createdAt: record.createdAt,
      activatedAt: record.activatedAt,
      completedAt: record.completedAt,
      archivedAt: record.archivedAt,
    });
  }
}
