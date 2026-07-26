import { OtpCodeAlreadyConsumedError, OtpCodeExpiredError } from './otp-code.errors';

export type OtpPurpose = 'email-verification' | 'password-reset';

export interface OtpCodeProps {
  id: string;
  userId: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

export class OtpCode {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly purpose: OtpPurpose,
    public readonly codeHash: string,
    public readonly expiresAt: Date,
    public readonly consumedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static fromPersistence(props: OtpCodeProps): OtpCode {
    return new OtpCode(props.id, props.userId, props.purpose, props.codeHash, props.expiresAt, props.consumedAt, props.createdAt);
  }

  isExpired(now: Date): boolean {
    return now.getTime() >= this.expiresAt.getTime();
  }

  isConsumed(): boolean {
    return this.consumedAt !== null;
  }

  /** Single-use enforcement: throws rather than silently no-op-ing, so a caller can never mistake a stale/replayed code for a fresh success. */
  assertUsable(now: Date): void {
    if (this.isConsumed()) {
      throw new OtpCodeAlreadyConsumedError();
    }
    if (this.isExpired(now)) {
      throw new OtpCodeExpiredError();
    }
  }

  consume(now: Date): OtpCode {
    this.assertUsable(now);
    return new OtpCode(this.id, this.userId, this.purpose, this.codeHash, this.expiresAt, now, this.createdAt);
  }
}
