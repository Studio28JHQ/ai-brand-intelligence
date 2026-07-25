import type { WorkflowContext, WorkflowHistoryListener, WorkflowProgressListener } from '@ai-visibility/core';

export const WORKFLOW_PORT = Symbol('WORKFLOW_PORT');

export interface WorkflowPort {
  run(
    context: WorkflowContext,
    onProgress?: WorkflowProgressListener,
    onHistory?: WorkflowHistoryListener,
  ): Promise<WorkflowContext>;
}
