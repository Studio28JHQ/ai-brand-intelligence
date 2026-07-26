import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user.repository';
import { IssueOtpUseCase } from './issue-otp.use-case';

/**
 * Always resolves the same way regardless of whether the email is registered — the controller
 * returns one identical generic response either way, satisfying "do not expose whether an email
 * exists" exactly, with no exception (unlike login/resend, forgot-password has no competing
 * requirement that would justify revealing anything).
 */
@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly issueOtpUseCase: IssueOtpUseCase,
  ) {}

  async execute(email: string): Promise<{ emailDelivered: boolean }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return { emailDelivered: true };
    }
    return this.issueOtpUseCase.execute(user, 'password-reset');
  }
}
