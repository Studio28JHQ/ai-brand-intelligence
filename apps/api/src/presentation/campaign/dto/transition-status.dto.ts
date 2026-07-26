export class TransitionCampaignStatusDto {
  status!: 'active' | 'completed' | 'archived';
}

export class TransitionActionStatusDto {
  status!: 'in-progress' | 'completed' | 'verified';
}
