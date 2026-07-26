import type { CycleStatus } from '@ai-visibility/contracts';
import { InvalidCycleStateTransitionError } from './optimization-cycle.errors';

export interface OptimizationCycleProps {
  id: string;
  projectId: string;
  goal: string;
  status: CycleStatus;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}

const VALID_TRANSITIONS: Record<CycleStatus, ReadonlyArray<CycleStatus>> = {
  planned: ['running'],
  running: ['verification'],
  verification: ['completed'],
  completed: [],
};

export class OptimizationCycle {
  private constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly goal: string,
    public readonly status: CycleStatus,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly createdAt: Date,
  ) {}

  static fromPersistence(props: OptimizationCycleProps): OptimizationCycle {
    return new OptimizationCycle(
      props.id,
      props.projectId,
      props.goal,
      props.status,
      props.startDate,
      props.endDate,
      props.createdAt,
    );
  }

  /** Human-facing label for `status` — the ticket's Lifecycle has exactly the four `status` values, so this is not a second state dimension. */
  get currentPhase(): CycleStatus {
    return this.status;
  }

  private assertTransition(to: CycleStatus): void {
    if (!VALID_TRANSITIONS[this.status].includes(to)) {
      throw new InvalidCycleStateTransitionError(this.status, to);
    }
  }

  start(startedAt: Date): OptimizationCycle {
    this.assertTransition('running');
    return new OptimizationCycle(this.id, this.projectId, this.goal, 'running', startedAt, this.endDate, this.createdAt);
  }

  beginVerification(): OptimizationCycle {
    this.assertTransition('verification');
    return new OptimizationCycle(this.id, this.projectId, this.goal, 'verification', this.startDate, this.endDate, this.createdAt);
  }

  complete(completedAt: Date): OptimizationCycle {
    this.assertTransition('completed');
    return new OptimizationCycle(
      this.id,
      this.projectId,
      this.goal,
      'completed',
      this.startDate,
      completedAt,
      this.createdAt,
    );
  }
}
