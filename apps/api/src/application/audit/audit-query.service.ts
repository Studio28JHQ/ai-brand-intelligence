import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';

@Injectable()
export class AuditQueryService {
  constructor(@Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository) {}

  async list(): Promise<Audit[]> {
    return this.auditRepository.findAll();
  }

  async getById(id: string): Promise<Audit | null> {
    return this.auditRepository.findById(id);
  }

  async getLatest(): Promise<Audit | null> {
    return this.auditRepository.findLatest();
  }
}
