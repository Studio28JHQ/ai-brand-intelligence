import type { ExecutionPlan } from '@ai-visibility/core';
import { AuditType } from './audit-type';
import { CapabilityRegistry } from './capability-registry';
import { CapabilityCatalog } from './capability-catalog';

export class ExecutionPlanBuilder {
  constructor(
    private readonly catalog: CapabilityCatalog,
    private readonly registry: CapabilityRegistry,
  ) {}

  build(auditType: AuditType): ExecutionPlan {
    return {
      id: auditType.id,
      steps: auditType.productCapabilityIds.map((productCapabilityId) => {
        const technicalCapabilityId = this.catalog.resolveTechnicalCapabilityId(productCapabilityId);
        return this.registry.resolve(technicalCapabilityId).step;
      }),
    };
  }
}
