import { OtpCode, OtpPurpose } from './otp-code.entity';

export const OTP_CODE_REPOSITORY = Symbol('OTP_CODE_REPOSITORY');

export interface OtpCodeRepository {
  create(userId: string, purpose: OtpPurpose, codeHash: string, expiresAt: Date): Promise<OtpCode>;
  findById(id: string): Promise<OtpCode | null>;
  /** The most recently issued code for this user+purpose — older, superseded codes are never checked again, even if technically still unexpired. */
  findLatestByUserAndPurpose(userId: string, purpose: OtpPurpose): Promise<OtpCode | null>;
  save(otpCode: OtpCode): Promise<OtpCode>;
}
