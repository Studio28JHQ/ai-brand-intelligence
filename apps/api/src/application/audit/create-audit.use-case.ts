import { Inject, Injectable } from '@nestjs/common';
import { Audit } from '../../domain/audit/audit.entity';
import { AuditUrl } from '../../domain/audit/audit-url.vo';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';

@Injectable()
export class CreateAuditUseCase {
  constructor(@Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository) {}

  async execute(rawUrl: string): Promise<Audit> {
    const url = AuditUrl.create(rawUrl);
    return this.auditRepository.create(url.value);
  }
}
