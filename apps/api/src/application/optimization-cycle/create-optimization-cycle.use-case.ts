import { Inject, Injectable } from '@nestjs/common';
import { OPTIMIZATION_CYCLE_REPOSITORY, OptimizationCycleRepository } from '../../domain/optimization-cycle/optimization-cycle.repository';
import { OptimizationCycle } from '../../domain/optimization-cycle/optimization-cycle.entity';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { ProjectNotFoundError } from '../../domain/project/project.errors';

@Injectable()
export class CreateOptimizationCycleUseCase {
  constructor(
    @Inject(OPTIMIZATION_CYCLE_REPOSITORY) private readonly optimizationCycleRepository: OptimizationCycleRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(projectId: string, goal: string): Promise<OptimizationCycle> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    return this.optimizationCycleRepository.create(projectId, goal);
  }
}
