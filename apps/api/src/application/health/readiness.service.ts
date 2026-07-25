import { Injectable } from '@nestjs/common';
import type { ReadinessResponse } from '@ai-visibility/contracts';
import { DatabaseHealthChecker } from '../../infrastructure/health/database-health.checker';
import { RedisHealthChecker } from '../../infrastructure/health/redis-health.checker';
import { ObjectStorageHealthChecker } from '../../infrastructure/health/object-storage-health.checker';
import { WorkflowRuntimeChecker } from '../../infrastructure/health/workflow-runtime.checker';
import { getApplicationVersion } from '../../infrastructure/health/application-version';

@Injectable()
export class ReadinessService {
  constructor(
    private readonly databaseHealthChecker: DatabaseHealthChecker,
    private readonly redisHealthChecker: RedisHealthChecker,
    private readonly objectStorageHealthChecker: ObjectStorageHealthChecker,
    private readonly workflowRuntimeChecker: WorkflowRuntimeChecker,
  ) {}

  async check(): Promise<ReadinessResponse> {
    const [database, redis, objectStorage, workflowRuntime] = await Promise.all([
      this.databaseHealthChecker.check(),
      this.redisHealthChecker.check(),
      this.objectStorageHealthChecker.check(),
      this.workflowRuntimeChecker.check(),
    ]);

    const allUp = [database, redis, objectStorage, workflowRuntime].every((dependency) => dependency.status === 'up');

    return {
      status: allUp ? 'ready' : 'not-ready',
      version: getApplicationVersion(),
      dependencies: { database, redis, objectStorage },
      workflowRuntime,
    };
  }
}
