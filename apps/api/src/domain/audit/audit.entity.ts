import { InvalidAuditStateTransitionError } from './audit.errors';

export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AuditProps {
  id: string;
  url: string;
  status: AuditStatus;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  cancelledAt: Date | null;
}

const VALID_TRANSITIONS: Record<AuditStatus, ReadonlyArray<AuditStatus>> = {
  pending: ['running', 'cancelled'],
  running: ['completed', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
};

export class Audit {
  private constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly status: AuditStatus,
    public readonly createdAt: Date,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly failedAt: Date | null,
    public readonly cancelledAt: Date | null,
  ) {}

  static fromPersistence(props: AuditProps): Audit {
    return new Audit(
      props.id,
      props.url,
      props.status,
      props.createdAt,
      props.startedAt,
      props.completedAt,
      props.failedAt,
      props.cancelledAt,
    );
  }

  private assertTransition(to: AuditStatus): void {
    if (!VALID_TRANSITIONS[this.status].includes(to)) {
      throw new InvalidAuditStateTransitionError(this.status, to);
    }
  }

  start(startedAt: Date): Audit {
    this.assertTransition('running');
    return new Audit(
      this.id,
      this.url,
      'running',
      this.createdAt,
      startedAt,
      this.completedAt,
      this.failedAt,
      this.cancelledAt,
    );
  }

  complete(completedAt: Date): Audit {
    this.assertTransition('completed');
    return new Audit(
      this.id,
      this.url,
      'completed',
      this.createdAt,
      this.startedAt,
      completedAt,
      this.failedAt,
      this.cancelledAt,
    );
  }

  fail(failedAt: Date): Audit {
    this.assertTransition('failed');
    return new Audit(
      this.id,
      this.url,
      'failed',
      this.createdAt,
      this.startedAt,
      this.completedAt,
      failedAt,
      this.cancelledAt,
    );
  }

  cancel(cancelledAt: Date): Audit {
    this.assertTransition('cancelled');
    return new Audit(
      this.id,
      this.url,
      'cancelled',
      this.createdAt,
      this.startedAt,
      this.completedAt,
      this.failedAt,
      cancelledAt,
    );
  }
}
