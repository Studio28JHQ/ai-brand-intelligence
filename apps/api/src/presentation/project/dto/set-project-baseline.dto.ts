import { IsNotEmpty, IsString } from 'class-validator';

export class SetProjectBaselineDto {
  @IsString()
  @IsNotEmpty()
  auditId!: string;
}
