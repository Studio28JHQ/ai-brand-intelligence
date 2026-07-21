import { Injectable } from '@nestjs/common';
import { runDiscovery } from '@ai-visibility/discovery-engine';
import { DiscoveryPort, DiscoveryResult } from '../../domain/audit/discovery.port';

@Injectable()
export class DiscoveryAdapter implements DiscoveryPort {
  async discover(auditId: string, url: string): Promise<DiscoveryResult> {
    return runDiscovery(auditId, url);
  }
}
