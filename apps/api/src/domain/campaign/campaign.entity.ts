import type { CampaignStatus } from '@ai-visibility/contracts';
import { InvalidCampaignStateTransitionError } from './campaign.errors';

export interface CampaignProps {
  id: string;
  projectId: string;
  cycleId: string;
  sourceAuditId: string;
  status: CampaignStatus;
  createdAt: Date;
  activatedAt: Date | null;
  completedAt: Date | null;
  archivedAt: Date | null;
}

const VALID_TRANSITIONS: Record<CampaignStatus, ReadonlyArray<CampaignStatus>> = {
  draft: ['active'],
  active: ['completed'],
  completed: ['archived'],
  archived: [],
};

export class Campaign {
  private constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly cycleId: string,
    public readonly sourceAuditId: string,
    public readonly status: CampaignStatus,
    public readonly createdAt: Date,
    public readonly activatedAt: Date | null,
    public readonly completedAt: Date | null,
    public readonly archivedAt: Date | null,
  ) {}

  static fromPersistence(props: CampaignProps): Campaign {
    return new Campaign(
      props.id,
      props.projectId,
      props.cycleId,
      props.sourceAuditId,
      props.status,
      props.createdAt,
      props.activatedAt,
      props.completedAt,
      props.archivedAt,
    );
  }

  private assertTransition(to: CampaignStatus): void {
    if (!VALID_TRANSITIONS[this.status].includes(to)) {
      throw new InvalidCampaignStateTransitionError(this.status, to);
    }
  }

  activate(activatedAt: Date): Campaign {
    this.assertTransition('active');
    return new Campaign(
      this.id,
      this.projectId,
      this.cycleId,
      this.sourceAuditId,
      'active',
      this.createdAt,
      activatedAt,
      this.completedAt,
      this.archivedAt,
    );
  }

  complete(completedAt: Date): Campaign {
    this.assertTransition('completed');
    return new Campaign(
      this.id,
      this.projectId,
      this.cycleId,
      this.sourceAuditId,
      'completed',
      this.createdAt,
      this.activatedAt,
      completedAt,
      this.archivedAt,
    );
  }

  archive(archivedAt: Date): Campaign {
    this.assertTransition('archived');
    return new Campaign(
      this.id,
      this.projectId,
      this.cycleId,
      this.sourceAuditId,
      'archived',
      this.createdAt,
      this.activatedAt,
      this.completedAt,
      archivedAt,
    );
  }
}
