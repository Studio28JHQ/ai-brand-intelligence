export type AuditStatus = 'pending' | 'running' | 'completed';

export interface AuditProps {
  id: string;
  url: string;
  status: AuditStatus;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export class Audit {
  private constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly status: AuditStatus,
    public readonly createdAt: Date,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
  ) {}

  static fromPersistence(props: AuditProps): Audit {
    return new Audit(
      props.id,
      props.url,
      props.status,
      props.createdAt,
      props.startedAt,
      props.completedAt,
    );
  }
}
