import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AuthActionResponse, LoginResponse, RegisterResponse, VerifyOtpResponse } from '@ai-visibility/contracts';
import { RegisterUserUseCase } from '../../application/auth/register-user.use-case';
import { VerifyOtpUseCase } from '../../application/auth/verify-otp.use-case';
import { ResendOtpUseCase } from '../../application/auth/resend-otp.use-case';
import { LoginUseCase } from '../../application/auth/login.use-case';
import { ForgotPasswordUseCase } from '../../application/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/auth/reset-password.use-case';
import { GetCurrentUserUseCase } from '../../application/auth/get-current-user.use-case';
import { UserAlreadyExistsError, UserNotFoundError } from '../../domain/user/user.errors';
import {
  EmailNotVerifiedError,
  InvalidCredentialsError,
  InvalidResetTokenError,
  PasswordConfirmationMismatchError,
} from '../../application/auth/auth.errors';
import {
  OtpCodeAlreadyConsumedError,
  OtpCodeExpiredError,
  OtpCodeMismatchError,
  OtpCodeNotFoundError,
} from '../../domain/otp/otp-code.errors';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { toUserMetadata } from './user-metadata.mapper';

const GENERIC_OTP_SENT_MESSAGE = 'If an account exists for this email, a verification code has been sent.';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly resendOtpUseCase: ResendOtpUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    try {
      const user = await this.registerUserUseCase.execute(dto);
      return { email: user.email };
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      if (error instanceof PasswordConfirmationMismatchError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyOtp(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
    try {
      const result = await this.verifyOtpUseCase.execute(dto);
      return { verified: true, ...(result.resetToken ? { resetToken: result.resetToken } : {}) };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (
        error instanceof OtpCodeNotFoundError ||
        error instanceof OtpCodeExpiredError ||
        error instanceof OtpCodeAlreadyConsumedError ||
        error instanceof OtpCodeMismatchError
      ) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Post('resend-otp')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async resendOtp(@Body() dto: ResendOtpDto): Promise<AuthActionResponse> {
    try {
      await this.resendOtpUseCase.execute(dto.email, dto.purpose);
      return { success: true, message: GENERIC_OTP_SENT_MESSAGE };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body() dto: LoginDto): Promise<LoginResponse> {
    try {
      const { token, expiresInSeconds } = await this.loginUseCase.execute({
        email: dto.email,
        password: dto.password,
        rememberMe: dto.rememberMe ?? false,
      });
      const user = await this.getCurrentUserUseCase.execute(token);
      return { token, expiresInSeconds, user: toUserMetadata(user!) };
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(error.message);
      }
      if (error instanceof EmailNotVerifiedError) {
        throw new ForbiddenException(error.message);
      }
      throw error;
    }
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<AuthActionResponse> {
    await this.forgotPasswordUseCase.execute(dto.email);
    return { success: true, message: GENERIC_OTP_SENT_MESSAGE };
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<AuthActionResponse> {
    try {
      await this.resetPasswordUseCase.execute(dto);
      return { success: true, message: 'Your password has been reset. You can now sign in.' };
    } catch (error) {
      if (error instanceof InvalidResetTokenError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof PasswordConfirmationMismatchError) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof UserNotFoundError) {
        throw new BadRequestException('This password reset link is invalid or has expired.');
      }
      throw error;
    }
  }

  @Get('me')
  async me(@Req() request: Request): Promise<{ user: ReturnType<typeof toUserMetadata> | null }> {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return { user: null };
    }
    const user = await this.getCurrentUserUseCase.execute(token);
    return { user: user ? toUserMetadata(user) : null };
  }
}
