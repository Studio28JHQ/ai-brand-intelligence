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

export class AuditInProgressError extends Error {
  constructor(id: string) {
    super(`Cannot delete Audit ${id} while it is still pending or running. Wait for it to finish first.`);
    this.name = 'AuditInProgressError';
  }
}

export class BaselineDeletionRequiresConfirmationError extends Error {
  constructor(id: string, projectId: string) {
    super(`Audit ${id} is the Baseline for Project ${projectId}. Confirm deletion to also clear the Project's Baseline.`);
    this.name = 'BaselineDeletionRequiresConfirmationError';
  }
}

// This platform has no mechanism to interrupt an in-flight Workflow pipeline once it's actually
// running (F10-S04E, see docs/04_PROJECT/DECISION_LOG.md#cto-107) — a real 'running' Audit cannot
// be honestly cancelled, only a not-yet-started 'queued'/'pending' one (a pure status flip, no
// process to kill).
export class AuditNotCancellableError extends Error {
  constructor(id: string, status: string) {
    super(`Cannot cancel Audit ${id}: it is '${status}'. Only a queued or pending Audit can be cancelled.`);
    this.name = 'AuditNotCancellableError';
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
