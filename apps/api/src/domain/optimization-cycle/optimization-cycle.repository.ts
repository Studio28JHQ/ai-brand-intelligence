import { OptimizationCycle } from './optimization-cycle.entity';

export const OPTIMIZATION_CYCLE_REPOSITORY = Symbol('OPTIMIZATION_CYCLE_REPOSITORY');

export interface OptimizationCycleRepository {
  create(projectId: string, goal: string): Promise<OptimizationCycle>;
  findById(id: string): Promise<OptimizationCycle | null>;
  findLatestByProjectId(projectId: string): Promise<OptimizationCycle | null>;
  start(id: string, startedAt: Date): Promise<OptimizationCycle>;
  beginVerification(id: string): Promise<OptimizationCycle>;
  complete(id: string, completedAt: Date): Promise<OptimizationCycle>;
}
