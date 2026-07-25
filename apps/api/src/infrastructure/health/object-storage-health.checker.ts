import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { DependencyCheck } from '@ai-visibility/contracts';
import { checkTcpConnectivity } from './tcp-connectivity.checker';

@Injectable()
export class ObjectStorageHealthChecker {
  async check(): Promise<DependencyCheck> {
    const config = loadConfig();
    const reachable = await checkTcpConnectivity(config.MINIO_HOST, config.MINIO_API_PORT);
    return reachable
      ? { status: 'up' }
      : { status: 'down', message: `Unable to reach object storage at ${config.MINIO_HOST}:${config.MINIO_API_PORT}` };
  }
}
