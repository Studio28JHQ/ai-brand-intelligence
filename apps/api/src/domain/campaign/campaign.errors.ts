import type { CampaignStatus, OptimizationActionStatus } from '@ai-visibility/contracts';

export class CampaignNotFoundError extends Error {
  constructor(id: string) {
    super(`Campaign not found: ${id}`);
    this.name = 'CampaignNotFoundError';
  }
}

export class InvalidCampaignStateTransitionError extends Error {
  constructor(from: CampaignStatus, to: CampaignStatus) {
    super(`Cannot transition campaign from '${from}' to '${to}'.`);
    this.name = 'InvalidCampaignStateTransitionError';
  }
}

export class OptimizationActionNotFoundError extends Error {
  constructor(id: string) {
    super(`Optimization action not found: ${id}`);
    this.name = 'OptimizationActionNotFoundError';
  }
}

export class InvalidActionStateTransitionError extends Error {
  constructor(from: OptimizationActionStatus, to: OptimizationActionStatus) {
    super(`Cannot transition optimization action from '${from}' to '${to}'.`);
    this.name = 'InvalidActionStateTransitionError';
  }
}

export class NoCompletedAuditError extends Error {
  constructor(projectId: string) {
    super(`Cannot create a campaign for project ${projectId}: no completed audit exists yet.`);
    this.name = 'NoCompletedAuditError';
  }
}
