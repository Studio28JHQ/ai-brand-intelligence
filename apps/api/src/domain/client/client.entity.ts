export type ClientStatus = 'active' | 'inactive';

export interface ClientProps {
  id: string;
  name: string;
  industry: string;
  primaryDomain: string;
  status: ClientStatus;
  createdAt: Date;
}

export class Client {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly industry: string,
    public readonly primaryDomain: string,
    public readonly status: ClientStatus,
    public readonly createdAt: Date,
  ) {}

  static fromPersistence(props: ClientProps): Client {
    return new Client(props.id, props.name, props.industry, props.primaryDomain, props.status, props.createdAt);
  }
}
