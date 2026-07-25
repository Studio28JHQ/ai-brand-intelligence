import { Module } from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../../domain/project/project.repository';
import { ProjectQueryService } from '../../application/project/project-query.service';
import { PrismaProjectRepository } from '../../infrastructure/project/prisma-project.repository';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ProjectController } from './project.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectController],
  providers: [ProjectQueryService, { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository }],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
