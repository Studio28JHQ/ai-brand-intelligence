import { Module } from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../../domain/project/project.repository';
import { PrismaProjectRepository } from './prisma-project.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository }],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectRepositoryModule {}
