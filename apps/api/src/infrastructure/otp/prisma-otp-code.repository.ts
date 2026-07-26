import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { OtpCode, OtpPurpose } from '../../domain/otp/otp-code.entity';
import { OtpCodeRepository } from '../../domain/otp/otp-code.repository';
import { PRISMA_CLIENT } from '../database/database.module';

interface OtpCodeRecord {
  id: string;
  userId: string;
  purpose: string;
  codeHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

@Injectable()
export class PrismaOtpCodeRepository implements OtpCodeRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(userId: string, purpose: OtpPurpose, codeHash: string, expiresAt: Date): Promise<OtpCode> {
    const record = await this.prisma.otpCode.create({
      data: { userId, purpose, codeHash, expiresAt },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<OtpCode | null> {
    const record = await this.prisma.otpCode.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findLatestByUserAndPurpose(userId: string, purpose: OtpPurpose): Promise<OtpCode | null> {
    const record = await this.prisma.otpCode.findFirst({
      where: { userId, purpose },
      orderBy: { createdAt: 'desc' },
    });
    return record ? this.toDomain(record) : null;
  }

  async save(otpCode: OtpCode): Promise<OtpCode> {
    const record = await this.prisma.otpCode.update({
      where: { id: otpCode.id },
      data: { consumedAt: otpCode.consumedAt },
    });
    return this.toDomain(record);
  }

  private toDomain(record: OtpCodeRecord): OtpCode {
    return OtpCode.fromPersistence({
      id: record.id,
      userId: record.userId,
      purpose: record.purpose as OtpPurpose,
      codeHash: record.codeHash,
      expiresAt: record.expiresAt,
      consumedAt: record.consumedAt,
      createdAt: record.createdAt,
    });
  }
}
