import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ReadinessService } from '../../application/health/readiness.service';
import { DatabaseHealthChecker } from '../../infrastructure/health/database-health.checker';
import { RedisHealthChecker } from '../../infrastructure/health/redis-health.checker';
import { ObjectStorageHealthChecker } from '../../infrastructure/health/object-storage-health.checker';
import { WorkflowRuntimeChecker } from '../../infrastructure/health/workflow-runtime.checker';
import { HealthController } from './health.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [
    ReadinessService,
    DatabaseHealthChecker,
    RedisHealthChecker,
    ObjectStorageHealthChecker,
    WorkflowRuntimeChecker,
  ],
})
export class HealthModule {}
