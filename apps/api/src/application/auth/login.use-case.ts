import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user.repository';
import { EmailNotVerifiedError, InvalidCredentialsError } from './auth.errors';
import { PasswordHasher } from './password-hasher';
import { SessionTokenService } from './session-token.service';

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResult {
  token: string;
  expiresInSeconds: number;
}

/**
 * Never distinguishes "no such account" from "wrong password" — both produce the identical
 * `InvalidCredentialsError`, per "do not expose whether an email exists." The one deliberate
 * exception is an unverified account: the ticket's own LOGIN section requires a specific,
 * actionable message there ("show a clear message and allow resending"), so that one case alone
 * is distinguishable — a password check still happens first, so a wrong password against an
 * unverified account still yields the generic message, not the verification prompt.
 */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.verify(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    if (!user.isVerified) {
      throw new EmailNotVerifiedError();
    }

    const { token, expiresInSeconds } = this.sessionTokenService.issueSessionToken(user.id, user.email, input.rememberMe);
    return { token, expiresInSeconds };
  }
}
