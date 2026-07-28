import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { User, UserLocale, UserStatus } from '../../domain/user/user.entity';
import { UserRepository } from '../../domain/user/user.repository';
import { UserNotFoundError } from '../../domain/user/user.errors';
import { PRISMA_CLIENT } from '../database/database.module';

interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  status: string;
  createdAt: Date;
  verifiedAt: Date | null;
  locale: string | null;
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(firstName: string, lastName: string, email: string, passwordHash: string): Promise<User> {
    const record = await this.prisma.user.create({
      data: { firstName, lastName, email, passwordHash },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async markVerified(id: string, verifiedAt: Date): Promise<User> {
    const current = await this.findByIdOrThrow(id);
    const verified = current.verify(verifiedAt);
    return this.persist(verified);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.withPasswordHash(passwordHash));
  }

  async updateLocale(id: string, locale: UserLocale): Promise<User> {
    const current = await this.findByIdOrThrow(id);
    return this.persist(current.withLocale(locale));
  }

  private async findByIdOrThrow(id: string): Promise<User> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) {
      throw new UserNotFoundError(id);
    }
    return this.toDomain(record);
  }

  private async persist(user: User): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: user.passwordHash,
        status: user.status,
        verifiedAt: user.verifiedAt,
        locale: user.locale,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: UserRecord): User {
    return User.fromPersistence({
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      passwordHash: record.passwordHash,
      status: record.status as UserStatus,
      createdAt: record.createdAt,
      verifiedAt: record.verifiedAt,
      locale: record.locale as UserLocale | null,
    });
  }
}
