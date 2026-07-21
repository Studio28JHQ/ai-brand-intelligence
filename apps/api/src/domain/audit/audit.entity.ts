export type AuditStatus = 'pending';

export interface AuditProps {
  id: string;
  url: string;
  status: AuditStatus;
  createdAt: Date;
}

export class Audit {
  private constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly status: AuditStatus,
    public readonly createdAt: Date,
  ) {}

  static fromPersistence(props: AuditProps): Audit {
    return new Audit(props.id, props.url, props.status, props.createdAt);
  }
}
