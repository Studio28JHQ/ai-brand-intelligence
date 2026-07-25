import { Module } from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../../domain/project/project.repository';
import { ProjectQueryService } from '../../application/project/project-query.service';
import { SetProjectBaselineUseCase } from '../../application/project/set-project-baseline.use-case';
import { PrismaProjectRepository } from '../../infrastructure/project/prisma-project.repository';
import { AuditRepositoryModule } from '../../infrastructure/audit/audit-repository.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ProjectController } from './project.controller';

@Module({
  imports: [DatabaseModule, AuditRepositoryModule],
  controllers: [ProjectController],
  providers: [
    ProjectQueryService,
    SetProjectBaselineUseCase,
    { provide: PROJECT_REPOSITORY, useClass: PrismaProjectRepository },
  ],
  exports: [PROJECT_REPOSITORY],
})
export class ProjectModule {}
