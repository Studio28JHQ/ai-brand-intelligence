import type { WorkflowStep } from '@ai-visibility/core';
import { AuditType } from './audit-type';
import { CapabilityRegistry } from './capability-registry';

export class ExecutionPlanBuilder {
  constructor(private readonly registry: CapabilityRegistry) {}

  build(auditType: AuditType): WorkflowStep[] {
    return auditType.capabilityIds.map((capabilityId) => this.registry.resolve(capabilityId).step);
  }
}
