import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { AuditInProgressError, AuditNotFoundError, BaselineDeletionRequiresConfirmationError } from '../../domain/audit/audit.errors';

@Injectable()
export class DeleteAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(auditId: string, confirmBaseline: boolean): Promise<void> {
    const audit = await this.auditRepository.findById(auditId);
    if (!audit) {
      throw new AuditNotFoundError(auditId);
    }

    if (audit.status === 'pending' || audit.status === 'running') {
      throw new AuditInProgressError(auditId);
    }

    const project = await this.projectRepository.findById(audit.projectId);
    const isBaseline = project?.baselineAuditId === audit.id;

    if (isBaseline && !confirmBaseline) {
      throw new BaselineDeletionRequiresConfirmationError(auditId, audit.projectId);
    }

    await this.auditRepository.delete(auditId);

    if (project && isBaseline) {
      await this.projectRepository.clearBaseline(project.id);
    }

    if (project && project.lastAuditId === auditId) {
      const remaining = await this.auditRepository.findAll();
      const nextLastAudit = remaining
        .filter((candidate) => candidate.projectId === project.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      await this.projectRepository.updateLastAudit(project.id, nextLastAudit?.id ?? null);
    }
  }
}
