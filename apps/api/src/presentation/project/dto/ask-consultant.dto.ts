import { IsNotEmpty, IsString } from 'class-validator';

export class AskConsultantDto {
  @IsString()
  @IsNotEmpty()
  intentType!: string;

  @IsString()
  @IsNotEmpty()
  question!: string;
}
