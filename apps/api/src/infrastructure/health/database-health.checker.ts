import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { DependencyCheck } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

@Injectable()
export class DatabaseHealthChecker {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async check(): Promise<DependencyCheck> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'up' };
    } catch (error) {
      return { status: 'down', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
