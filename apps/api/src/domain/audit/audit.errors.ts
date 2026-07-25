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

export class AuditNotCompletedError extends Error {
  constructor(id: string) {
    super(`Audit is not completed: ${id}`);
    this.name = 'AuditNotCompletedError';
  }
}

export class UnknownCapabilityError extends Error {
  constructor(capabilityId: string) {
    super(`Unknown capability: ${capabilityId}`);
    this.name = 'UnknownCapabilityError';
  }
}

export class UnknownProductCapabilityError extends Error {
  constructor(productCapabilityId: string) {
    super(`Unknown product capability: ${productCapabilityId}`);
    this.name = 'UnknownProductCapabilityError';
  }
}
