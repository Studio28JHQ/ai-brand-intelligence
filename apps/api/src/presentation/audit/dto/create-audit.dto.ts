import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuditDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientId?: string;
}
