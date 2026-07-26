import { Inject, Injectable } from '@nestjs/common';
import { OtpPurpose } from '../../domain/otp/otp-code.entity';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user.repository';
import { UserNotFoundError } from '../../domain/user/user.errors';
import { IssueOtpUseCase } from './issue-otp.use-case';

@Injectable()
export class ResendOtpUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly issueOtpUseCase: IssueOtpUseCase,
  ) {}

  async execute(email: string, purpose: OtpPurpose): Promise<{ emailDelivered: boolean }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // 'email-verification' resend is only reachable right after this exact email just
      // registered, so there is nothing left to protect by staying silent. 'password-reset'
      // resend sits behind forgot-password, which deliberately never reveals whether an email
      // exists — resend must preserve that same guarantee rather than leaking it back out here,
      // including in whether `emailDelivered` looks any different from the real-user path.
      if (purpose === 'email-verification') {
        throw new UserNotFoundError(email);
      }
      return { emailDelivered: true };
    }

    return this.issueOtpUseCase.execute(user, purpose);
  }
}
