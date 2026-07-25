import { Injectable } from '@nestjs/common';
import { loadConfig } from '@ai-visibility/config';
import type { DependencyCheck } from '@ai-visibility/contracts';
import { checkTcpConnectivity } from './tcp-connectivity.checker';

@Injectable()
export class RedisHealthChecker {
  async check(): Promise<DependencyCheck> {
    const config = loadConfig();
    const reachable = await checkTcpConnectivity(config.REDIS_HOST, config.REDIS_PORT);
    return reachable
      ? { status: 'up' }
      : { status: 'down', message: `Unable to reach Redis at ${config.REDIS_HOST}:${config.REDIS_PORT}` };
  }
}
