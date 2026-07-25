export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project not found: ${id}`);
    this.name = 'ProjectNotFoundError';
  }
}

export class BaselineAuditMismatchError extends Error {
  constructor(projectId: string, auditId: string) {
    super(`Audit ${auditId} does not belong to project ${projectId}`);
    this.name = 'BaselineAuditMismatchError';
  }
}

export class BaselineAuditNotCompletedError extends Error {
  constructor(auditId: string) {
    super(`Audit ${auditId} is not completed and cannot be set as a baseline`);
    this.name = 'BaselineAuditNotCompletedError';
  }
}
