import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/user/user.entity';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user.repository';
import { UserAlreadyExistsError } from '../../domain/user/user.errors';
import { PasswordConfirmationMismatchError } from './auth.errors';
import { PasswordHasher } from './password-hasher';
import { IssueOtpUseCase } from './issue-otp.use-case';

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Registration is the one place in this flow allowed to reveal whether an email is already
 * registered (`UserAlreadyExistsError`) — collision detection is inherent to account creation
 * itself; the "never expose whether an email exists" requirement applies to login and forgot-
 * password, where no such disclosure is necessary (see `LoginUseCase`/`ForgotPasswordUseCase`).
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly issueOtpUseCase: IssueOtpUseCase,
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    if (input.password !== input.confirmPassword) {
      throw new PasswordConfirmationMismatchError();
    }

    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create(input.firstName, input.lastName, input.email, passwordHash);

    await this.issueOtpUseCase.execute(user, 'email-verification');

    return user;
  }
}
