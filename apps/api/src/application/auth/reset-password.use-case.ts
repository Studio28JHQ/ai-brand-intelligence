import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user.repository';
import { UserNotFoundError } from '../../domain/user/user.errors';
import { InvalidResetTokenError, PasswordConfirmationMismatchError } from './auth.errors';
import { PasswordHasher } from './password-hasher';
import { SessionTokenService } from './session-token.service';

export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
  confirmNewPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    if (input.newPassword !== input.confirmNewPassword) {
      throw new PasswordConfirmationMismatchError();
    }

    const payload = this.sessionTokenService.verifyResetToken(input.resetToken);
    if (!payload) {
      throw new InvalidResetTokenError();
    }

    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UserNotFoundError(payload.sub);
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePassword(user.id, passwordHash);
  }
}
