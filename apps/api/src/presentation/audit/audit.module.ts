import { Module } from '@nestjs/common';
import type { Engine } from '@ai-visibility/core';
import { AUDIT_REPOSITORY } from '../../domain/audit/audit.repository';
import { EXECUTION_PIPELINE_PORT } from '../../domain/audit/execution-pipeline.port';
import { AUDIT_ENGINES } from '../../domain/audit/audit-engines.token';
import { CreateAuditUseCase } from '../../application/audit/create-audit.use-case';
import { ExecuteAuditUseCase } from '../../application/audit/execute-audit.use-case';
import { PrismaAuditRepository } from '../../infrastructure/audit/prisma-audit.repository';
import { DiscoveryEngineAdapter } from '../../infrastructure/audit/discovery-engine.adapter';
import { ExecutionPipelineAdapter } from '../../infrastructure/audit/execution-pipeline.adapter';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { AuditController } from './audit.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [AuditController],
  providers: [
    CreateAuditUseCase,
    ExecuteAuditUseCase,
    { provide: AUDIT_REPOSITORY, useClass: PrismaAuditRepository },
    { provide: EXECUTION_PIPELINE_PORT, useClass: ExecutionPipelineAdapter },
    DiscoveryEngineAdapter,
    {
      provide: AUDIT_ENGINES,
      useFactory: (discoveryEngineAdapter: DiscoveryEngineAdapter): Engine[] => [discoveryEngineAdapter],
      inject: [DiscoveryEngineAdapter],
    },
  ],
})
export class AuditModule {}
