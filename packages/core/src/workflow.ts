import { WorkflowContext } from './workflow-context';
import { WorkflowStep } from './workflow-step';

export class Workflow {
  constructor(private readonly steps: ReadonlyArray<WorkflowStep>) {}

  async run(context: WorkflowContext): Promise<WorkflowContext> {
    let current = context;

    for (const step of this.steps) {
      current = await step.run(current);
    }

    return current;
  }
}
