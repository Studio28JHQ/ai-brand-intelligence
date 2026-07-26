import { Inject, Injectable } from '@nestjs/common';
import { OptimizationAction } from '../../domain/campaign/optimization-action.entity';
import {
  OPTIMIZATION_ACTION_REPOSITORY,
  OptimizationActionRepository,
} from '../../domain/campaign/optimization-action.repository';

@Injectable()
export class TransitionActionStatusUseCase {
  constructor(
    @Inject(OPTIMIZATION_ACTION_REPOSITORY) private readonly optimizationActionRepository: OptimizationActionRepository,
  ) {}

  async start(id: string): Promise<OptimizationAction> {
    return this.optimizationActionRepository.start(id, new Date());
  }

  async complete(id: string): Promise<OptimizationAction> {
    return this.optimizationActionRepository.complete(id, new Date());
  }

  async verify(id: string): Promise<OptimizationAction> {
    return this.optimizationActionRepository.verify(id, new Date());
  }
}
