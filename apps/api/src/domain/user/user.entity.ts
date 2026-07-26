import { InvalidUserStateTransitionError } from './user.errors';

export type UserStatus = 'pending-verification' | 'verified';

export interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  createdAt: Date;
  verifiedAt: Date | null;
}

const VALID_TRANSITIONS: Record<UserStatus, ReadonlyArray<UserStatus>> = {
  'pending-verification': ['verified'],
  verified: [],
};

export class User {
  private constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly status: UserStatus,
    public readonly createdAt: Date,
    public readonly verifiedAt: Date | null,
  ) {}

  static fromPersistence(props: UserProps): User {
    return new User(
      props.id,
      props.firstName,
      props.lastName,
      props.email,
      props.passwordHash,
      props.status,
      props.createdAt,
      props.verifiedAt,
    );
  }

  get isVerified(): boolean {
    return this.status === 'verified';
  }

  verify(verifiedAt: Date): User {
    if (!VALID_TRANSITIONS[this.status].includes('verified')) {
      throw new InvalidUserStateTransitionError(this.status, 'verified');
    }
    return new User(
      this.id,
      this.firstName,
      this.lastName,
      this.email,
      this.passwordHash,
      'verified',
      this.createdAt,
      verifiedAt,
    );
  }

  withPasswordHash(passwordHash: string): User {
    return new User(
      this.id,
      this.firstName,
      this.lastName,
      this.email,
      passwordHash,
      this.status,
      this.createdAt,
      this.verifiedAt,
    );
  }
}
