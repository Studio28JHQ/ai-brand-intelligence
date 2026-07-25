import { Injectable } from '@nestjs/common';
import { Workflow } from '@ai-visibility/core';
import type { ExecutionPlan, WorkflowContext } from '@ai-visibility/core';
import type { DependencyCheck } from '@ai-visibility/contracts';

@Injectable()
export class WorkflowRuntimeChecker {
  async check(): Promise<DependencyCheck> {
    try {
      const plan: ExecutionPlan = { id: 'health-check', steps: [] };
      const context: WorkflowContext = {
        auditId: 'health-check',
        url: 'health-check',
        workflowId: 'health-check',
        metadata: { startedAt: new Date().toISOString() },
        results: {},
      };

      await new Workflow(plan).run(context);
      return { status: 'up' };
    } catch (error) {
      return { status: 'down', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
