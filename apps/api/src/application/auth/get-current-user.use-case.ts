import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user.entity';
import { SessionTokenService } from './session-token.service';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly sessionTokenService: SessionTokenService,
  ) {}

  async execute(sessionToken: string): Promise<User | null> {
    const payload = this.sessionTokenService.verifySessionToken(sessionToken);
    if (!payload) {
      return null;
    }
    return this.userRepository.findById(payload.sub);
  }
}
