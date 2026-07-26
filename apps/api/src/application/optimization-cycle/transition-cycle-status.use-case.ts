import { Inject, Injectable } from '@nestjs/common';
import { OptimizationCycle } from '../../domain/optimization-cycle/optimization-cycle.entity';
import { OPTIMIZATION_CYCLE_REPOSITORY, OptimizationCycleRepository } from '../../domain/optimization-cycle/optimization-cycle.repository';

@Injectable()
export class TransitionCycleStatusUseCase {
  constructor(
    @Inject(OPTIMIZATION_CYCLE_REPOSITORY) private readonly optimizationCycleRepository: OptimizationCycleRepository,
  ) {}

  async start(id: string): Promise<OptimizationCycle> {
    return this.optimizationCycleRepository.start(id, new Date());
  }

  async beginVerification(id: string): Promise<OptimizationCycle> {
    return this.optimizationCycleRepository.beginVerification(id);
  }

  async complete(id: string): Promise<OptimizationCycle> {
    return this.optimizationCycleRepository.complete(id, new Date());
  }
}
