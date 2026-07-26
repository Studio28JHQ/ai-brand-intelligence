import { Module } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../domain/client/client.repository';
import { PrismaClientRepository } from './prisma-client.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: CLIENT_REPOSITORY, useClass: PrismaClientRepository }],
  exports: [CLIENT_REPOSITORY],
})
export class ClientRepositoryModule {}
