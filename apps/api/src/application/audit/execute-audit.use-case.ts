import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import type { WorkflowContext } from '@ai-visibility/core';
import type { WorkflowProgress, WorkflowResult } from '@ai-visibility/contracts';
import { WORKFLOW_PORT, WorkflowPort } from '../../domain/audit/workflow.port';

export interface ExecuteAuditOutcome {
  results: WorkflowResult;
  progress: WorkflowProgress[];
}

@Injectable()
export class ExecuteAuditUseCase {
  constructor(@Inject(WORKFLOW_PORT) private readonly workflow: WorkflowPort) {}

  async execute(auditId: string, url: string): Promise<ExecuteAuditOutcome> {
    const context: WorkflowContext = {
      auditId,
      url,
      workflowId: randomUUID(),
      metadata: { startedAt: new Date().toISOString() },
      results: {},
    };

    const progress: WorkflowProgress[] = [];
    const { results } = await this.workflow.run(context, (step) => progress.push(step));

    return { results, progress };
  }
}
