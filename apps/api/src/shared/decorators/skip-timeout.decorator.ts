import { SetMetadata } from '@nestjs/common';

export const SKIP_TIMEOUT_KEY = 'skipTimeout';

// Mirrors @nestjs/throttler's @SkipThrottle() convention already used for health checks
// (apps/api/src/presentation/health/health.controller.ts). Long-lived SSE connections (Live Audit
// Execution, F10-S04B) must not be cut off by the global request timeout.
export const SkipTimeout = () => SetMetadata(SKIP_TIMEOUT_KEY, true);
