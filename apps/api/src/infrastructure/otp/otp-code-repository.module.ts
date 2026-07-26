import { Module } from '@nestjs/common';
import { OTP_CODE_REPOSITORY } from '../../domain/otp/otp-code.repository';
import { PrismaOtpCodeRepository } from './prisma-otp-code.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: OTP_CODE_REPOSITORY, useClass: PrismaOtpCodeRepository }],
  exports: [OTP_CODE_REPOSITORY],
})
export class OtpCodeRepositoryModule {}
