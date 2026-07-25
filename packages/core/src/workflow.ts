import type { WorkflowExecutionRecord, WorkflowProgress } from '@ai-visibility/contracts';
import { ExecutionPlan } from './execution-plan';
import { WorkflowContext } from './workflow-context';

export type WorkflowProgressListener = (progress: WorkflowProgress) => void;
export type WorkflowHistoryListener = (record: WorkflowExecutionRecord) => void;

export class Workflow {
  constructor(private readonly plan: ExecutionPlan) {}

  async run(
    context: WorkflowContext,
    onProgress?: WorkflowProgressListener,
    onHistory?: WorkflowHistoryListener,
  ): Promise<WorkflowContext> {
    let current = context;

    for (const step of this.plan.steps) {
      const startedAt = new Date();

      try {
        current = await step.run(current);
      } catch (error) {
        const completedAt = new Date();
        onHistory?.({
          stepId: step.name,
          status: 'failure',
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
          durationMs: completedAt.getTime() - startedAt.getTime(),
          errorCode: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      const completedAt = new Date();
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

      onHistory?.({
        stepId: step.name,
        status: 'success',
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs: completedAt.getTime() - startedAt.getTime(),
      });
    }

    return current;
  }
}
