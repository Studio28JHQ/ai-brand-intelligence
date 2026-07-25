import { Inject, Injectable } from '@nestjs/common';
import { Workflow } from '@ai-visibility/core';
import type { WorkflowContext, WorkflowHistoryListener, WorkflowProgressListener, WorkflowStep } from '@ai-visibility/core';
import { WorkflowPort } from '../../domain/audit/workflow.port';
import { AUDIT_WORKFLOW_STEPS } from '../../domain/audit/audit-workflow-steps.token';

@Injectable()
export class WorkflowAdapter implements WorkflowPort {
  private readonly workflow: Workflow;

  constructor(@Inject(AUDIT_WORKFLOW_STEPS) steps: WorkflowStep[]) {
    this.workflow = new Workflow(steps);
  }

  async run(
    context: WorkflowContext,
    onProgress?: WorkflowProgressListener,
    onHistory?: WorkflowHistoryListener,
  ): Promise<WorkflowContext> {
    return this.workflow.run(context, onProgress, onHistory);
  }
}
