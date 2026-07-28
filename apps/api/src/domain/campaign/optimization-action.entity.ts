import type { OptimizationActionStatus } from '@ai-visibility/contracts';
import { InvalidActionStateTransitionError } from './campaign.errors';

export interface OptimizationActionProps {
  id: string;
  campaignId: string;
  projectId: string;
  auditId: string;
  optimizationRuleId: string;
  optimizationRuleVersion: string;
  supportingFindingIds: string[];
  status: OptimizationActionStatus;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  verifiedAt: Date | null;
}

const VALID_TRANSITIONS: Record<OptimizationActionStatus, ReadonlyArray<OptimizationActionStatus>> = {
  pending: ['in-progress'],
  'in-progress': ['completed'],
  completed: ['verified'],
  verified: [],
};

export class OptimizationAction {
  private constructor(
    public readonly id: string,
    public readonly campaignId: string,
    public readonly projectId: string,
    public readonly auditId: string,
    public readonly optimizationRuleId: string,
    public readonly optimizationRuleVersion: string,
    public readonly supportingFindingIds: ReadonlyArray<string>,
    public readonly status: OptimizationActionStatus,
    public readonly createdAt: Date,
    public readonly startedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly verifiedAt: Date | null,
  ) {}

  static fromPersistence(props: OptimizationActionProps): OptimizationAction {
    return new OptimizationAction(
      props.id,
      props.campaignId,
      props.projectId,
      props.auditId,
      props.optimizationRuleId,
      props.optimizationRuleVersion,
      props.supportingFindingIds,
      props.status,
      props.createdAt,
      props.startedAt,
      props.completedAt,
      props.verifiedAt,
    );
  }

  private assertTransition(to: OptimizationActionStatus): void {
    if (!VALID_TRANSITIONS[this.status].includes(to)) {
      throw new InvalidActionStateTransitionError(this.status, to);
    }
  }

  start(startedAt: Date): OptimizationAction {
    this.assertTransition('in-progress');
    return new OptimizationAction(
      this.id,
      this.campaignId,
      this.projectId,
      this.auditId,
      this.optimizationRuleId,
      this.optimizationRuleVersion,
      this.supportingFindingIds,
      'in-progress',
      this.createdAt,
      startedAt,
      this.completedAt,
      this.verifiedAt,
    );
  }

  complete(completedAt: Date): OptimizationAction {
    this.assertTransition('completed');
    return new OptimizationAction(
      this.id,
      this.campaignId,
      this.projectId,
      this.auditId,
      this.optimizationRuleId,
      this.optimizationRuleVersion,
      this.supportingFindingIds,
      'completed',
      this.createdAt,
      this.startedAt,
      completedAt,
      this.verifiedAt,
    );
  }

  verify(verifiedAt: Date): OptimizationAction {
    this.assertTransition('verified');
    return new OptimizationAction(
      this.id,
      this.campaignId,
      this.projectId,
      this.auditId,
      this.optimizationRuleId,
      this.optimizationRuleVersion,
      this.supportingFindingIds,
      'verified',
      this.createdAt,
      this.startedAt,
      this.completedAt,
      verifiedAt,
    );
  }
}
