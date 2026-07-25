export interface ProjectProps {
  id: string;
  name: string;
  canonicalWebsite: string;
  createdAt: Date;
  lastAuditId: string | null;
  baselineAuditId: string | null;
  baselineSetAt: Date | null;
}

export class Project {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly canonicalWebsite: string,
    public readonly createdAt: Date,
    public readonly lastAuditId: string | null,
    public readonly baselineAuditId: string | null,
    public readonly baselineSetAt: Date | null,
  ) {}

  static fromPersistence(props: ProjectProps): Project {
    return new Project(
      props.id,
      props.name,
      props.canonicalWebsite,
      props.createdAt,
      props.lastAuditId,
      props.baselineAuditId,
      props.baselineSetAt,
    );
  }
}
