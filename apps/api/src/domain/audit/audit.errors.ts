import type { AuditStatus } from './audit.entity';

export class InvalidAuditUrlError extends Error {
  constructor(url: string) {
    super(`Invalid audit URL: ${url}`);
    this.name = 'InvalidAuditUrlError';
  }
}

export class InvalidAuditStateTransitionError extends Error {
  constructor(from: AuditStatus, to: AuditStatus) {
    super(`Cannot transition audit from '${from}' to '${to}'.`);
    this.name = 'InvalidAuditStateTransitionError';
  }
}

export class AuditNotFoundError extends Error {
  constructor(id: string) {
    super(`Audit not found: ${id}`);
    this.name = 'AuditNotFoundError';
  }
}
