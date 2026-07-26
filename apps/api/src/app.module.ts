import { Module } from '@nestjs/common';
import { HealthModule } from './presentation/health/health.module';
import { ClientModule } from './presentation/client/client.module';
import { ProjectModule } from './presentation/project/project.module';
import { AuditModule } from './presentation/audit/audit.module';
import { CampaignModule } from './presentation/campaign/campaign.module';
import { BriefingModule } from './presentation/briefing/briefing.module';
import { OptimizationCycleModule } from './presentation/optimization-cycle/optimization-cycle.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    ClientModule,
    ProjectModule,
    AuditModule,
    CampaignModule,
    BriefingModule,
    OptimizationCycleModule,
  ],
})
export class AppModule {}
