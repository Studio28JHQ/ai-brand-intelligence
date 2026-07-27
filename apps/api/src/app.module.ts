import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { loadConfig } from '@ai-visibility/config';
import { HealthModule } from './presentation/health/health.module';
import { ClientModule } from './presentation/client/client.module';
import { ProjectModule } from './presentation/project/project.module';
import { AuditModule } from './presentation/audit/audit.module';
import { CampaignModule } from './presentation/campaign/campaign.module';
import { BriefingModule } from './presentation/briefing/briefing.module';
import { OptimizationCycleModule } from './presentation/optimization-cycle/optimization-cycle.module';
import { OptimizationPatternModule } from './presentation/optimization-pattern/optimization-pattern.module';
import { AuthModule } from './presentation/auth/auth.module';
import { AiProviderModule } from './presentation/ai-provider/ai-provider.module';
import { DatabaseModule } from './infrastructure/database/database.module';

const config = loadConfig();

@Module({
  imports: [
    ThrottlerModule.forRoot([{ name: 'default', ttl: config.RATE_LIMIT_TTL_MS, limit: config.RATE_LIMIT_LIMIT }]),
    DatabaseModule,
    HealthModule,
    ClientModule,
    ProjectModule,
    AuditModule,
    CampaignModule,
    BriefingModule,
    OptimizationCycleModule,
    OptimizationPatternModule,
    AuthModule,
    AiProviderModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
