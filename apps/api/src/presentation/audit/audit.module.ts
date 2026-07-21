import { Module } from '@nestjs/common';
import { AUDIT_REPOSITORY } from '../../domain/audit/audit.repository';
import { DISCOVERY_PORT } from '../../domain/audit/discovery.port';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { ExecuteAuditUseCase } from '../../application/audit/execute-audit.use-case';
import { PrismaAuditRepository } from '../../infrastructure/audit/prisma-audit.repository';
import { DiscoveryAdapter } from '../../infrastructure/audit/discovery.adapter';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuditController } from './audit.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [
    CreateAuditUseCase,
    ExecuteAuditUseCase,
    { provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository },
    { provide: DISCOVERY_PORT, useClass: DiscoveryAdapter },
  ],
})
export class AuditModule {}
