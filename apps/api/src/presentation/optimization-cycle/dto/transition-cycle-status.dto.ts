import { IsNotEmpty, IsString } from 'class-validator';

export class TransitionCycleStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'running' | 'verification' | 'completed';
}
