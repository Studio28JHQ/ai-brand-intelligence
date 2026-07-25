import { WorkflowContext } from './workflow-context';

export interface WorkflowStep {
  readonly name: string;
  run(context: WorkflowContext): Promise<WorkflowContext>;
}
