import { Inject, Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import { OtpPurpose } from '../../domain/otp/otp-code.entity';
import { OTP_CODE_REPOSITORY, OtpCodeRepository } from '../../domain/otp/otp-code.repository';
import { EMAIL_SENDER, EmailSender } from '../notifications/email-sender';
import { OtpGenerator } from './otp-generator';
import { User } from '../../domain/user/user.entity';

const SUBJECT_BY_PURPOSE: Record<OtpPurpose, string> = {
  'email-verification': 'Verify your email — AI Visibility Auditor',
  'password-reset': 'Reset your password — AI Visibility Auditor',
};

function buildEmailBody(user: User, purpose: OtpPurpose, code: string, expirationMinutes: number): string {
  const action = purpose === 'email-verification' ? 'verify your email address' : 'reset your password';
  return (
    `Hi ${user.firstName},\n\n` +
    `Use this code to ${action}: ${code}\n\n` +
    `This code expires in ${expirationMinutes} minutes and can only be used once. ` +
    `If you didn't request this, you can safely ignore this email.`
  );
}

/**
 * Shared by registration, "resend code," and "forgot password" — each of those issues an OTP the
 * exact same way (generate, hash, persist with an expiration, email it). Only the previous, still-
 * unconsumed code for this user+purpose becomes unreachable (superseded, `findLatestByUserAndPurpose`
 * never returns it again) — it is not retroactively marked consumed, since it was simply never used.
 */
@Injectable()
export class IssueOtpUseCase {
  constructor(
    @Inject(OTP_CODE_REPOSITORY) private readonly otpCodeRepository: OtpCodeRepository,
    private readonly otpGenerator: OtpGenerator,
    @Inject(EMAIL_SENDER) private readonly emailSender: EmailSender,
  ) {}

  async execute(user: User, purpose: OtpPurpose): Promise<void> {
    const config = loadConfig();
    const code = this.otpGenerator.generate();
    const codeHash = this.otpGenerator.hash(code);
    const expiresAt = new Date(Date.now() + config.OTP_EXPIRATION_MINUTES * 60_000);

    await this.otpCodeRepository.create(user.id, purpose, codeHash, expiresAt);

    await this.emailSender.send({
      to: user.email,
      subject: SUBJECT_BY_PURPOSE[purpose],
      body: buildEmailBody(user, purpose, code, config.OTP_EXPIRATION_MINUTES),
    });
  }
}
