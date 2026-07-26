import { Inject, Injectable } from '@nestjs/common';
import { OtpPurpose } from '../../domain/otp/otp-code.entity';
import { OTP_CODE_REPOSITORY, OtpCodeRepository } from '../../domain/otp/otp-code.repository';
import { OtpCodeMismatchError, OtpCodeNotFoundError } from '../../domain/otp/otp-code.errors';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user.repository';
import { UserNotFoundError } from '../../domain/user/user.errors';
import { User } from '../../domain/user/user.entity';
import { OtpGenerator } from './otp-generator';
import { SessionTokenService } from './session-token.service';

export interface VerifyOtpInput {
  email: string;
  code: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpResult {
  user: User;
  /** Only populated for `purpose: 'password-reset'` — the proof `/reset-password` needs. */
  resetToken?: string;
}

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(OTP_CODE_REPOSITORY) private readonly otpCodeRepository: OtpCodeRepository,
    private readonly otpGenerator: OtpGenerator,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(input: VerifyOtpInput): Promise<VerifyOtpResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UserNotFoundError(input.email);
    }

    const otpCode = await this.otpCodeRepository.findLatestByUserAndPurpose(user.id, input.purpose);
    if (!otpCode) {
      throw new OtpCodeNotFoundError();
    }

    // Usability check first (expired/consumed) — assertUsable throws with the specific reason
    // before we even compare the code, so "expired" is never masked as a generic mismatch.
    otpCode.assertUsable(new Date());

    if (!this.otpGenerator.matches(input.code, otpCode.codeHash)) {
      throw new OtpCodeMismatchError();
    }

    const consumed = otpCode.consume(new Date());
    await this.otpCodeRepository.save(consumed);

    if (input.purpose === 'email-verification') {
      const verifiedUser = await this.userRepository.markVerified(user.id, new Date());
      return { user: verifiedUser };
    }

    return { user, resetToken: this.sessionTokenService.issueResetToken(user.id) };
  }
}
