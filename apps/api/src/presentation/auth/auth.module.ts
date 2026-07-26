import { Module } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import { UserRepositoryModule } from '../../infrastructure/user/user-repository.module';
import { OtpCodeRepositoryModule } from '../../infrastructure/otp/otp-code-repository.module';
import { EMAIL_PROVIDER_TOKEN, EmailProvider } from '../../application/notifications/email-provider';
import { ConsoleEmailProvider } from '../../infrastructure/notifications/console-email-provider';
import { ResendEmailProvider } from '../../infrastructure/notifications/resend-email-provider';
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
    {
      provide: EMAIL_PROVIDER_TOKEN,
      // `assertEmailProviderConfigured` (called at API bootstrap, `main.ts`) has already refused
      // to start if `EMAIL_PROVIDER=resend` (the default) was chosen without `RESEND_API_KEY` — this
      // factory can assume whatever `EMAIL_PROVIDER` says is safe to construct. Registering a new
      // provider (SES/Postmark/SendGrid/Mailgun) means adding one branch here plus one new class
      // implementing `EmailProvider`; nothing else in the module changes.
      useFactory: (): EmailProvider => {
        const config = loadConfig();
        return config.EMAIL_PROVIDER === 'resend' ? new ResendEmailProvider() : new ConsoleEmailProvider();
      },
    },
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
