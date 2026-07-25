import { WorkflowStep } from './workflow-step';

export interface ExecutionPlan {
  readonly id: string;
  readonly steps: ReadonlyArray<WorkflowStep>;
}
