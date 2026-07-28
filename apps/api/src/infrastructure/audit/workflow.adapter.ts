import { Inject, Injectable } from '@nestjs/common';
import { Workflow } from '@ai-visibility/core';
import type {
  ExecutionPlan,
  WorkflowContext,
  WorkflowHistoryListener,
  WorkflowProgressListener,
  WorkflowStepEventListener,
} from '@ai-visibility/core';
import { WorkflowPort } from '../../domain/audit/workflow.port';
import { AUDIT_EXECUTION_PLAN } from '../../domain/audit/audit-execution-plan.token';

@Injectable()
export class WorkflowAdapter implements WorkflowPort {
  private readonly workflow: Workflow;

  constructor(@Inject(AUDIT_EXECUTION_PLAN) plan: ExecutionPlan) {
    this.workflow = new Workflow(plan);
  }

  async run(
    context: WorkflowContext,
    onProgress?: WorkflowProgressListener,
    onHistory?: WorkflowHistoryListener,
    onStepEvent?: WorkflowStepEventListener,
  ): Promise<WorkflowContext> {
    return this.workflow.run(context, onProgress, onHistory, onStepEvent);
  }
}
