import { Injectable } from '@nestjs/common';
import type { AuditContext, Engine } from '@ai-visibility/core';
import { runDiscovery } from '@ai-visibility/discovery-engine';
import { DiscoveryResult } from '../../domain/audit/discovery-result';

@Injectable()
export class DiscoveryEngineAdapter implements Engine<DiscoveryResult> {
  readonly name = 'discovery';

  async run(context: AuditContext): Promise<DiscoveryResult> {
    return runDiscovery(context.auditId, context.url);
  }
}
