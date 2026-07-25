export interface ProjectProps {
  id: string;
  name: string;
  canonicalWebsite: string;
  createdAt: Date;
  lastAuditId: string | null;
}

export class Project {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly canonicalWebsite: string,
    public readonly createdAt: Date,
    public readonly lastAuditId: string | null,
  ) {}

  static fromPersistence(props: ProjectProps): Project {
    return new Project(props.id, props.name, props.canonicalWebsite, props.createdAt, props.lastAuditId);
  }
}
