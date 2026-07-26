import { Inject, Injectable } from '@nestjs/common';
import { OPTIMIZATION_CYCLE_REPOSITORY, OptimizationCycleRepository } from '../../domain/optimization-cycle/optimization-cycle.repository';
import { OptimizationCycle } from '../../domain/optimization-cycle/optimization-cycle.entity';

@Injectable()
export class OptimizationCycleQueryService {
  constructor(
    @Inject(OPTIMIZATION_CYCLE_REPOSITORY) private readonly optimizationCycleRepository: OptimizationCycleRepository,
  ) {}

  async getById(id: string): Promise<OptimizationCycle | null> {
    return this.optimizationCycleRepository.findById(id);
  }

  async getCurrentByProjectId(projectId: string): Promise<OptimizationCycle | null> {
    return this.optimizationCycleRepository.findLatestByProjectId(projectId);
  }
}
