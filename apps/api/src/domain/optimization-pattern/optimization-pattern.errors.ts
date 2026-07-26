export class OptimizationPatternNotFoundError extends Error {
  constructor(id: string) {
    super(`Optimization pattern not found: ${id}`);
    this.name = 'OptimizationPatternNotFoundError';
  }
}

export class InvalidPatternStateTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Cannot transition optimization pattern from '${from}' to '${to}'.`);
    this.name = 'InvalidPatternStateTransitionError';
  }
}
