import { Module } from '@nestjs/common';
import { HealthModule } from './presentation/health/health.module';
import { ClientModule } from './presentation/client/client.module';
import { ProjectModule } from './presentation/project/project.module';
import { AuditModule } from './presentation/audit/audit.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule, HealthModule, ClientModule, ProjectModule, AuditModule],
})
export class AppModule {}
