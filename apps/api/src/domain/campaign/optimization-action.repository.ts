import { OptimizationAction } from './optimization-action.entity';

export const OPTIMIZATION_ACTION_REPOSITORY = Symbol('OPTIMIZATION_ACTION_REPOSITORY');

export interface OptimizationActionRepository {
  findById(id: string): Promise<OptimizationAction | null>;
  findByCampaignId(campaignId: string): Promise<OptimizationAction[]>;
  start(id: string, startedAt: Date): Promise<OptimizationAction>;
  complete(id: string, completedAt: Date): Promise<OptimizationAction>;
  verify(id: string, verifiedAt: Date): Promise<OptimizationAction>;
}
