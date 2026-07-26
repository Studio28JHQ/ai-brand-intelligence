import type { CycleStatus } from '@ai-visibility/contracts';

export class OptimizationCycleNotFoundError extends Error {
  constructor(id: string) {
    super(`Optimization cycle not found: ${id}`);
    this.name = 'OptimizationCycleNotFoundError';
  }
}

export class InvalidCycleStateTransitionError extends Error {
  constructor(from: CycleStatus, to: CycleStatus) {
    super(`Cannot transition optimization cycle from '${from}' to '${to}'.`);
    this.name = 'InvalidCycleStateTransitionError';
  }
}
