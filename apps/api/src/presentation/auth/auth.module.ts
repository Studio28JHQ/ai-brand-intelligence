import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '../../infrastructure/user/user-repository.module';
import { OtpCodeRepositoryModule } from '../../infrastructure/otp/otp-code-repository.module';
import { EMAIL_SENDER } from '../../application/notifications/email-sender';
import { ConsoleEmailSender } from '../../infrastructure/notifications/console-email-sender';
import { PasswordHasher } from '../../application/auth/password-hasher';
import { OtpGenerator } from '../../application/auth/otp-generator';
import { SessionTokenService } from '../../application/auth/session-token.service';
import { IssueOtpUseCase } from '../../application/auth/issue-otp.use-case';
import { RegisterUserUseCase } from '../../application/auth/register-user.use-case';
import { VerifyOtpUseCase } from '../../application/auth/verify-otp.use-case';
import { ResendOtpUseCase } from '../../application/auth/resend-otp.use-case';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { ForgotPasswordUseCase } from '../../application/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/auth/reset-password.use-case';
import { GetCurrentUserUseCase } from '../../application/auth/get-current-user.use-case';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserRepositoryModule, OtpCodeRepositoryModule],
  controllers: [AuthController],
  providers: [
    { provide: EMAIL_SENDER, useClass: ConsoleEmailSender },
    PasswordHasher,
    OtpGenerator,
    SessionTokenService,
    IssueOtpUseCase,
    RegisterUserUseCase,
    VerifyOtpUseCase,
    ResendOtpUseCase,
    LoginUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GetCurrentUserUseCase,
  ],
})
export class AuthModule {}
