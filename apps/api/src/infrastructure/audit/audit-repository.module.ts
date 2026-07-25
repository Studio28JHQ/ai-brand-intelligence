import { Module } from '@nestjs/common';
import { AUDIT_REPOSITORY } from '../../domain/audit/audit.repository';
import { PrismaAuditRepository } from './prisma-audit.repository';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository }],
  exports: [AUDIT_REPOSITORY],
})
export class AuditRepositoryModule {}
