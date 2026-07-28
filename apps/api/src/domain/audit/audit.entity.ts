import { InvalidAuditStateTransitionError } from './audit.errors';

// 'queued' is a genuinely distinct pre-'pending' state (F10-S04D, see
// docs/04_PROJECT/DECISION_LOG.md#cto-106): a Project may have only one Audit truly in flight
// ('pending'/'running') at a time (CTO-103's partial unique index, unchanged), so a request that
// arrives while another is already in flight is persisted immediately as 'queued' — a real row,
// visible in Audit History — rather than rejected. It transitions straight to 'running' once
// dequeued; 'pending' still means exactly what it always has (the brief pre-'running' window for
// an Audit that was never queued at all).
export type AuditStatus = 'queued' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AuditProps {
  id: string;
  projectId: string;
  cycleId: string;
  url: string;
  status: AuditStatus;
  triggeredBy: string | null;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  failedAt: Date | null;
  cancelledAt: Date | null;
}

const VALID_TRANSITIONS: Record<AuditStatus, ReadonlyArray<AuditStatus>> = {
  queued: ['running', 'cancelled'],
  pending: ['running', 'cancelled'],
  running: ['completed', 'failed', 'cancelled'],
  completed: [],
  failed: [],
  cancelled: [],
};

export class Audit {
  private constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly cycleId: string,
    public readonly url: string,
    public readonly status: AuditStatus,
    public readonly triggeredBy: string | null,
    public readonly createdAt: Date,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly failedAt: Date | null,
    public readonly cancelledAt: Date | null,
  ) {}

  static fromPersistence(props: AuditProps): Audit {
    return new Audit(
      props.id,
      props.projectId,
      props.cycleId,
      props.url,
      props.status,
      props.triggeredBy,
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
      this.projectId,
      this.cycleId,
      this.url,
      'running',
      this.triggeredBy,
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
      this.projectId,
      this.cycleId,
      this.url,
      'completed',
      this.triggeredBy,
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
      this.projectId,
      this.cycleId,
      this.url,
      'failed',
      this.triggeredBy,
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
      this.projectId,
      this.cycleId,
      this.url,
      'cancelled',
      this.triggeredBy,
      this.createdAt,
      this.startedAt,
      this.completedAt,
      this.failedAt,
      cancelledAt,
    );
  }
}
