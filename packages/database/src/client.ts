import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

let prismaClient: PrismaClient | undefined;

export function getPrismaClient(databaseUrl: string): PrismaClient {
  if (!prismaClient) {
    const adapter = new PrismaPg({ connectionString: databaseUrl });
    prismaClient = new PrismaClient({ adapter });
  }
  return prismaClient;
}

export async function disconnectDatabase(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = undefined;
  }
}
