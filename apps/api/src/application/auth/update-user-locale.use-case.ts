import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY, UserRepository } from '../../domain/user/user.repository';
import { User, UserLocale } from '../../domain/user/user.entity';

@Injectable()
export class UpdateUserLocaleUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepository: UserRepository) {}

  async execute(userId: string, locale: UserLocale): Promise<User> {
    return this.userRepository.updateLocale(userId, locale);
  }
}
