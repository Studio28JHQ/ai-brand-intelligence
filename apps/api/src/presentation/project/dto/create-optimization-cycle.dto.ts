import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOptimizationCycleDto {
  @IsString()
  @IsNotEmpty()
  goal!: string;
}
