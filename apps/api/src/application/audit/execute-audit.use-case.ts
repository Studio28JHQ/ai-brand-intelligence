import { Inject, Injectable } from '@nestjs/common';
import { DISCOVERY_PORT, DiscoveryPort, DiscoveryResult } from '../../domain/audit/discovery.port';

@Injectable()
export class ExecuteAuditUseCase {
  constructor(@Inject(DISCOVERY_PORT) private readonly discoveryPort: DiscoveryPort) {}

  async execute(auditId: string, url: string): Promise<DiscoveryResult> {
    return this.discoveryPort.discover(auditId, url);
  }
}
