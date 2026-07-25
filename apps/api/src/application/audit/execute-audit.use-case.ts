import { Inject, Injectable } from '@nestjs/common';
import type { WorkflowContext } from '@ai-visibility/core';
import type { WorkflowResult } from '@ai-visibility/contracts';
import { WORKFLOW_PORT, WorkflowPort } from '../../domain/audit/workflow.port';

@Injectable()
export class ExecuteAuditUseCase {
  constructor(@Inject(WORKFLOW_PORT) private readonly workflow: WorkflowPort) {}

  async execute(auditId: string, url: string): Promise<WorkflowResult> {
    const context: WorkflowContext = { auditId, url, results: {} };
    const { results } = await this.workflow.run(context);

    return results;
  }
}
