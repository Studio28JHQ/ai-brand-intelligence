import { Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowStep } from '@ai-visibility/core';
import { runEntityExtraction } from '@ai-visibility/entity-engine';
import type { EngineResult, EntityResult, InventoryResult } from '@ai-visibility/contracts';

@Injectable()
export class EntityStep implements WorkflowStep {
  readonly name = 'entity';

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    const inventoryResult = context.results.inventory as EngineResult<InventoryResult>;

    const startedAt = new Date();
    const output = await runEntityExtraction(context.auditId, inventoryResult.output!, context.correlationId);
    const completedAt = new Date();

    const entity: EngineResult<EntityResult> = {
      engine: this.name,
      status: 'success',
      output,
      metadata: { auditId: context.auditId },
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: completedAt.getTime() - startedAt.getTime(),
    };

    return { ...context, results: { ...context.results, entity } };
  }
}
