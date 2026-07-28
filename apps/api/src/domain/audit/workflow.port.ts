import type { WorkflowContext, WorkflowHistoryListener, WorkflowProgressListener, WorkflowStepEventListener } from '@ai-visibility/core';

export const WORKFLOW_PORT = Symbol('WORKFLOW_PORT');

export interface WorkflowPort {
  run(
    context: WorkflowContext,
    onProgress?: WorkflowProgressListener,
    onHistory?: WorkflowHistoryListener,
    onStepEvent?: WorkflowStepEventListener,
  ): Promise<WorkflowContext>;
}
