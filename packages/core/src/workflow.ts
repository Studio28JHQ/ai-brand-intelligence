import type { WorkflowProgress } from '@ai-visibility/contracts';
import { WorkflowContext } from './workflow-context';
import { WorkflowStep } from './workflow-step';

export type WorkflowProgressListener = (progress: WorkflowProgress) => void;

export class Workflow {
  constructor(private readonly steps: ReadonlyArray<WorkflowStep>) {}

  async run(context: WorkflowContext, onProgress?: WorkflowProgressListener): Promise<WorkflowContext> {
    let current = context;

    for (const step of this.steps) {
      current = await step.run(current);

      const result = current.results[step.name];
      if (onProgress && result) {
        onProgress({
          stepId: step.name,
          status: result.status,
          startedAt: result.startedAt,
          completedAt: result.completedAt,
          durationMs: result.durationMs,
        });
      }
    }

    return current;
  }
}
