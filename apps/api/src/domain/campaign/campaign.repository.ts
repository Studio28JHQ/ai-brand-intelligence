import { Campaign } from './campaign.entity';

export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY');

export interface NewActionSeed {
  title: string;
  supportingFindingIds: string[];
}

export interface CampaignRepository {
  create(projectId: string, sourceAuditId: string, cycleId: string, actionSeeds: NewActionSeed[]): Promise<Campaign>;
  findById(id: string): Promise<Campaign | null>;
  findLatestByProjectId(projectId: string): Promise<Campaign | null>;
  activate(id: string, activatedAt: Date): Promise<Campaign>;
  complete(id: string, completedAt: Date): Promise<Campaign>;
  archive(id: string, archivedAt: Date): Promise<Campaign>;
}
