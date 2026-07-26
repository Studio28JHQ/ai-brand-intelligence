import { Inject, Injectable } from '@nestjs/common';
import { OptimizationCycle } from '../../domain/optimization-cycle/optimization-cycle.entity';
import { OPTIMIZATION_CYCLE_REPOSITORY, OptimizationCycleRepository } from '../../domain/optimization-cycle/optimization-cycle.repository';

const DEFAULT_CYCLE_GOAL = 'Improve AI Visibility';

/**
 * Auto-provisions a Project's Optimization Cycle the same way `CreateAuditUseCase`
 * already auto-provisions a Client/Project from a URL (CTO-059) — every Audit must
 * belong to one Cycle, and callers of `POST /audits` are not required to plan a Cycle
 * up front. A `completed` Cycle is closed, so a fresh one starts; a `planned` Cycle is
 * auto-started, since an Audit is about to run inside it.
 */
@Injectable()
export class EnsureActiveCycleUseCase {
  constructor(
    @Inject(OPTIMIZATION_CYCLE_REPOSITORY) private readonly optimizationCycleRepository: OptimizationCycleRepository,
  ) {}

  async execute(projectId: string): Promise<OptimizationCycle> {
    const current = await this.optimizationCycleRepository.findLatestByProjectId(projectId);

    if (!current || current.status === 'completed') {
      const created = await this.optimizationCycleRepository.create(projectId, DEFAULT_CYCLE_GOAL);
      return this.optimizationCycleRepository.start(created.id, new Date());
    }

    if (current.status === 'planned') {
      return this.optimizationCycleRepository.start(current.id, new Date());
    }

    return current;
  }
}
