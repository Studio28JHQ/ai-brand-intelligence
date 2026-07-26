import type { OptimizationCycleMetadata } from '@ai-visibility/contracts';
import { OptimizationCycle } from '../../domain/optimization-cycle/optimization-cycle.entity';

export function toOptimizationCycleMetadata(cycle: OptimizationCycle): OptimizationCycleMetadata {
  return {
    id: cycle.id,
    projectId: cycle.projectId,
    goal: cycle.goal,
    status: cycle.status,
    currentPhase: cycle.currentPhase,
    startDate: cycle.startDate ? cycle.startDate.toISOString() : null,
    endDate: cycle.endDate ? cycle.endDate.toISOString() : null,
    createdAt: cycle.createdAt.toISOString(),
  };
}
