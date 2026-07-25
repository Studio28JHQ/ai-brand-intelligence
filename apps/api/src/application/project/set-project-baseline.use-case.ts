import { Inject, Injectable } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { Project } from '../../domain/project/project.entity';
import { ProjectNotFoundError, BaselineAuditMismatchError, BaselineAuditNotCompletedError } from '../../domain/project/project.errors';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { AuditNotFoundError } from '../../domain/audit/audit.errors';

@Injectable()
export class SetProjectBaselineUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
  ) {}

  async execute(projectId: string, auditId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const audit = await this.auditRepository.findById(auditId);
    if (!audit) {
      throw new AuditNotFoundError(auditId);
    }

    if (audit.projectId !== projectId) {
      throw new BaselineAuditMismatchError(projectId, auditId);
    }

    if (audit.status !== 'completed') {
      throw new BaselineAuditNotCompletedError(auditId);
    }

    return this.projectRepository.setBaseline(projectId, auditId);
  }
}
