import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

const PASSWORD_STRENGTH = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @Matches(PASSWORD_STRENGTH, {
    message: 'Password must include at least one uppercase letter, one lowercase letter, and one number.',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;
}
