import { IsEmail, IsIn } from 'class-validator';
import type { OtpPurpose } from '@ai-visibility/contracts';

const PURPOSES: OtpPurpose[] = ['email-verification', 'password-reset'];

export class ResendOtpDto {
  @IsEmail()
  email!: string;

  @IsIn(PURPOSES)
  purpose!: OtpPurpose;
}
