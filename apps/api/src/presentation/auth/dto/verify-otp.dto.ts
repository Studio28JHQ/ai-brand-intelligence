import { IsEmail, IsIn, Matches } from 'class-validator';
import type { OtpPurpose } from '@ai-visibility/contracts';

const PURPOSES: OtpPurpose[] = ['email-verification', 'password-reset'];

export class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @Matches(/^\d{6}$/, { message: 'Code must be exactly 6 digits.' })
  code!: string;

  @IsIn(PURPOSES)
  purpose!: OtpPurpose;
}
