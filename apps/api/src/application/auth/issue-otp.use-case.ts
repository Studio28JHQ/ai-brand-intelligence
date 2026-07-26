import { Inject, Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import { logger } from '@ai-visibility/shared';
import { OtpPurpose } from '../../domain/otp/otp-code.entity';
import { OTP_CODE_REPOSITORY, OtpCodeRepository } from '../../domain/otp/otp-code.repository';
import { EMAIL_PROVIDER_TOKEN, EmailProvider } from '../notifications/email-provider';
import { OtpGenerator } from './otp-generator';
import { User } from '../../domain/user/user.entity';
import { renderEmailTemplate } from '../notifications/email-template';

const SUBJECT_BY_PURPOSE: Record<OtpPurpose, string> = {
  'email-verification': 'Verify your email — AI Visibility Auditor',
  'password-reset': 'Reset your password — AI Visibility Auditor',
};

const HEADING_BY_PURPOSE: Record<OtpPurpose, string> = {
  'email-verification': 'Verify your email address',
  'password-reset': 'Reset your password',
};

function buildEmailContent(user: User, purpose: OtpPurpose, code: string, expirationMinutes: number) {
  const action = purpose === 'email-verification' ? 'verify your email address' : 'reset your password';
  return renderEmailTemplate({
    heading: HEADING_BY_PURPOSE[purpose],
    bodyLines: [
      `Hi ${user.firstName},`,
      `Use this code to ${action}: ${code}`,
      `This code expires in ${expirationMinutes} minutes and can only be used once. If you didn't request this, you can safely ignore this email.`,
    ],
  });
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
    @Inject(EMAIL_PROVIDER_TOKEN) private readonly emailProvider: EmailProvider,
  ) {}

  /**
   * The OTP is persisted before the email is attempted, and a failed send is caught here rather
   * than left to propagate — a real transactional-email provider can legitimately fail (timeout,
   * rejected credentials, provider outage), and that must never undo — or appear to undo — an
   * already-created account or an already-issued code. Callers surface `emailDelivered: false` to
   * the user instead of a hard failure (`F9-S02-HF01`).
   */
  async execute(user: User, purpose: OtpPurpose): Promise<{ emailDelivered: boolean }> {
    const config = loadConfig();
    const code = this.otpGenerator.generate();
    const codeHash = this.otpGenerator.hash(code);
    const expiresAt = new Date(Date.now() + config.OTP_EXPIRATION_MINUTES * 60_000);

    await this.otpCodeRepository.create(user.id, purpose, codeHash, expiresAt);

    try {
      const { html, text } = buildEmailContent(user, purpose, code, config.OTP_EXPIRATION_MINUTES);
      await this.emailProvider.send({
        to: user.email,
        subject: SUBJECT_BY_PURPOSE[purpose],
        html,
        text,
      });
      return { emailDelivered: true };
    } catch (error) {
      logger.error('Failed to send OTP email — the code was still issued and is valid', {
        userId: user.id,
        purpose,
        reason: error instanceof Error ? error.message : String(error),
      });
      return { emailDelivered: false };
    }
  }
}
