import { IsNotEmpty, IsString } from 'class-validator';

export class TransitionCampaignStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'active' | 'completed' | 'archived';
}

export class TransitionActionStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'in-progress' | 'completed' | 'verified';
}
