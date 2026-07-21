import { Inject, Injectable } from '@nestjs/common';
import { Audit } from '../../domain/audit/audit.entity';
import { AuditUrl } from '../../domain/audit/audit-url.vo';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { ExecuteAuditUseCase } from './execute-audit.use-case';

@Injectable()
export class CreateAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly executeAuditUseCase: ExecuteAuditUseCase,
  ) {}

  async execute(rawUrl: string): Promise<Audit> {
    const url = AuditUrl.create(rawUrl);
    const audit = await this.auditRepository.create(url.value);

    await this.auditRepository.markRunning(audit.id, new Date());
    await this.executeAuditUseCase.execute(audit.id);

    return this.auditRepository.markCompleted(audit.id, new Date());
  }
}
