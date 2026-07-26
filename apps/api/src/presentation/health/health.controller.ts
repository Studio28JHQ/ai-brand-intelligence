import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import type { HealthResponse, ReadinessResponse } from '@ai-visibility/contracts';
import { ReadinessService } from '../../application/health/readiness.service';

// Liveness/readiness probes are polled frequently by orchestrators (e.g. every few seconds by
// Kubernetes) — the global rate limit exists for user-facing endpoints, not infrastructure checks.
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Get()
  check(): HealthResponse {
    return { status: 'ok' };
  }

  @Get('live')
  liveness(): HealthResponse {
    return { status: 'ok' };
  }

  @Get('ready')
  async readiness(@Res({ passthrough: true }) res: Response): Promise<ReadinessResponse> {
    const result = await this.readinessService.check();
    res.status(result.status === 'ready' ? 200 : 503);
    return result;
  }
}
