import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { WorkflowContext, WorkflowHistoryListener, WorkflowStepEventListener } from '@ai-visibility/core';
import type { WorkflowProgress, WorkflowResult } from '@ai-visibility/contracts';
import { WORKFLOW_PORT, WorkflowPort } from '../../domain/audit/workflow.port';

export interface ExecuteAuditOutcome {
  results: WorkflowResult;
  progress: WorkflowProgress[];
}

@Injectable()
export class ExecuteAuditUseCase {
  constructor(@Inject(WORKFLOW_PORT) private readonly workflow: WorkflowPort) {}

  async execute(
    auditId: string,
    url: string,
    correlationId: string,
    onHistory?: WorkflowHistoryListener,
    onStepEvent?: WorkflowStepEventListener,
  ): Promise<ExecuteAuditOutcome> {
    const context: WorkflowContext = {
      auditId,
      url,
      correlationId,
      workflowId: randomUUID(),
      metadata: { startedAt: new Date().toISOString() },
      results: {},
    };

    const progress: WorkflowProgress[] = [];
    const { results } = await this.workflow.run(context, (step) => progress.push(step), onHistory, onStepEvent);

    return { results, progress };
  }
}
