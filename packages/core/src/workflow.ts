import { emitTelemetryEvent } from '@ai-visibility/shared';
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

    emitTelemetryEvent({
      name: 'workflow.started',
      category: 'workflow',
      severity: 'info',
      correlationId: context.correlationId,
      source: 'workflow-runtime',
      data: { workflowId: context.workflowId, planId: this.plan.id, auditId: context.auditId },
    });

    for (const step of this.plan.steps) {
      const startedAt = new Date();

      emitTelemetryEvent({
        name: 'workflow.step.started',
        category: 'workflow',
        severity: 'info',
        correlationId: context.correlationId,
        source: step.name,
        data: { workflowId: context.workflowId, planId: this.plan.id, auditId: context.auditId },
      });

      try {
        current = await step.run(current);
      } catch (error) {
        const completedAt = new Date();
        emitTelemetryEvent({
          name: 'workflow.step.failed',
          category: 'workflow',
          severity: 'error',
          correlationId: context.correlationId,
          source: step.name,
          data: {
            workflowId: context.workflowId,
            planId: this.plan.id,
            auditId: context.auditId,
            durationMs: completedAt.getTime() - startedAt.getTime(),
            errorMessage: error instanceof Error ? error.message : String(error),
          },
        });
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

      emitTelemetryEvent({
        name: 'workflow.step.completed',
        category: 'workflow',
        severity: 'info',
        correlationId: context.correlationId,
        source: step.name,
        data: {
          workflowId: context.workflowId,
          planId: this.plan.id,
          auditId: context.auditId,
          durationMs: completedAt.getTime() - startedAt.getTime(),
        },
      });

      onHistory?.({
        stepId: step.name,
        status: 'success',
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs: completedAt.getTime() - startedAt.getTime(),
      });
    }

    emitTelemetryEvent({
      name: 'workflow.completed',
      category: 'workflow',
      severity: 'info',
      correlationId: context.correlationId,
      source: 'workflow-runtime',
      data: { workflowId: context.workflowId, planId: this.plan.id, auditId: context.auditId },
    });

    return current;
  }
}
