import { Module } from '@nestjs/common';
import { AUDIT_REPOSITORY } from '../../domain/audit/audit.repository';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { ExecuteAuditUseCase } from '../../application/audit/execute-audit.use-case';
import { PrismaAuditRepository } from '../../infrastructure/audit/prisma-audit.repository';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuditController } from './audit.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [
    CreateAuditUseCase,
    ExecuteAuditUseCase,
    { provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository },
  ],
})
export class AuditModule {}
