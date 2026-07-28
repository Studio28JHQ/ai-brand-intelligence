import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAuditDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  clientId?: string;

  // Which real UI surface started this Audit — see AuditRequest.triggeredBy in schema.prisma.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  triggeredBy?: string;
}
