import { Module, OnApplicationShutdown } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import { disconnectDatabase, getPrismaClient, type PrismaClient } from '@ai-visibility/database';

export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT');

@Module({
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: async (): Promise<PrismaClient> => {
        const config = loadConfig();
        const client = getPrismaClient(config.DATABASE_URL);
        await client.$queryRaw`SELECT 1`;
        return client;
      },
    },
  ],
  exports: [PRISMA_CLIENT],
})
export class DatabaseModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await disconnectDatabase();
  }
}
