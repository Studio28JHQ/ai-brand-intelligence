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

export class DuplicateAuditExecutionError extends Error {
  // `inFlightAuditId` is `null` when this is raised from the database-level backstop (a unique
  // constraint violation, PrismaAuditRepository.create) rather than the application-level check
  // (CreateAuditUseCase) — the database only tells us the insert collided, not which existing row
  // it collided with, so the message stays honest about not knowing the specific Audit id.
  constructor(projectId: string, inFlightAuditId: string | null) {
    super(
      inFlightAuditId
        ? `Project ${projectId} already has an Audit in progress (${inFlightAuditId}). Wait for it to finish before starting another.`
        : `Project ${projectId} already has an Audit in progress. Wait for it to finish before starting another.`,
    );
    this.name = 'DuplicateAuditExecutionError';
  }
}

export class PageComparisonUrlMismatchError extends Error {
  constructor(baselineAuditId: string, targetAuditId: string) {
    super(`Cannot compare Audit ${baselineAuditId} and Audit ${targetAuditId}: they audited different URLs.`);
    this.name = 'PageComparisonUrlMismatchError';
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
