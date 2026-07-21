import { Module } from '@nestjs/common';
import { HealthModule } from './presentation/health/health.module';
import { AuditModule } from './presentation/audit/audit.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule, HealthModule, AuditModule],
})
export class AppModule {}
