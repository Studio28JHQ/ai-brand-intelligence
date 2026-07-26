export class ProjectBaselineNotSetError extends Error {
  constructor(projectId: string) {
    super(`Cannot generate an impact assessment for project ${projectId}: no baseline audit is set.`);
    this.name = 'ProjectBaselineNotSetError';
  }
}

export class NoVerificationAuditError extends Error {
  constructor(projectId: string) {
    super(`Cannot generate an impact assessment for project ${projectId}: no completed audit is available to verify against.`);
    this.name = 'NoVerificationAuditError';
  }
}

export class VerificationAuditMismatchError extends Error {
  constructor(auditId: string, projectId: string) {
    super(`Audit ${auditId} does not belong to project ${projectId} and cannot be used as a verification audit.`);
    this.name = 'VerificationAuditMismatchError';
  }
}
