import { Injectable } from '@nestjs/common';
import type { AiProviderConnectionStatus, AiProviderId } from '@ai-visibility/contracts';

interface StatusEntry {
  status: AiProviderConnectionStatus;
  lastSuccessfulTestAt: string | null;
}

/**
 * In-memory only, process-lifetime — a Test Connection result is operational health state, not a
 * business record, so it doesn't warrant a Prisma model (matching this codebase's existing
 * precedent for ephemeral state, e.g. rate-limit counters). Resets on restart; that's acceptable —
 * `connectionStatus` starts `'untested'`/`'not-configured'` again and the CTO can re-run Test
 * Connection.
 */
@Injectable()
export class AiProviderStatusStore {
  private readonly entries = new Map<AiProviderId, StatusEntry>();

  record(providerId: AiProviderId, status: AiProviderConnectionStatus): void {
    const lastSuccessfulTestAt = status === 'connected' ? new Date().toISOString() : this.entries.get(providerId)?.lastSuccessfulTestAt ?? null;
    this.entries.set(providerId, { status, lastSuccessfulTestAt });
  }

  get(providerId: AiProviderId): StatusEntry | undefined {
    return this.entries.get(providerId);
  }
}
