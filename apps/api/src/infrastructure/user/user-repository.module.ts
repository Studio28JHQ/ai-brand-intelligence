import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/user/user.repository';
import { PrismaUserRepository } from './prisma-user.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: USER_REPOSITORY, useClass: PrismaUserRepository }],
  exports: [USER_REPOSITORY],
})
export class UserRepositoryModule {}
