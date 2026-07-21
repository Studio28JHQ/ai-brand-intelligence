import { Inject, Injectable } from '@nestjs/common';
import { AuditUrl } from '../../domain/audit/audit-url.vo';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { CreateAuditResult } from './create-audit.result';
import { ExecuteAuditUseCase } from './execute-audit.use-case';

@Injectable()
export class CreateAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly executeAuditUseCase: ExecuteAuditUseCase,
  ) {}

  async execute(rawUrl: string): Promise<CreateAuditResult> {
    const url = AuditUrl.create(rawUrl);
    const audit = await this.auditRepository.create(url.value);

    await this.auditRepository.markRunning(audit.id, new Date());
    const { discovery, crawl } = await this.executeAuditUseCase.execute(audit.id, url.value);
    const completedAudit = await this.auditRepository.markCompleted(audit.id, new Date());

    return { audit: completedAudit, discovery, crawl };
  }
}
