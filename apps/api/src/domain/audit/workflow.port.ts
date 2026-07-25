import type { WorkflowContext, WorkflowProgressListener } from '@ai-visibility/core';

export const WORKFLOW_PORT = Symbol('WORKFLOW_PORT');

export interface WorkflowPort {
  run(context: WorkflowContext, onProgress?: WorkflowProgressListener): Promise<WorkflowContext>;
}
