import type { WorkflowContext } from '@ai-visibility/core';

export const WORKFLOW_PORT = Symbol('WORKFLOW_PORT');

export interface WorkflowPort {
  run(context: WorkflowContext): Promise<WorkflowContext>;
}
