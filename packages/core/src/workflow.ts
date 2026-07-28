import { emitTelemetryEvent } from '@ai-visibility/shared';
import type { AuditStepProgressEvent, WorkflowExecutionRecord, WorkflowProgress } from '@ai-visibility/contracts';
import { ExecutionPlan } from './execution-plan';
import { WorkflowContext } from './workflow-context';

export type WorkflowProgressListener = (progress: WorkflowProgress) => void;
export type WorkflowHistoryListener = (record: WorkflowExecutionRecord) => void;
export type WorkflowStepEventListener = (event: AuditStepProgressEvent) => void;

export class Workflow {
  constructor(private readonly plan: ExecutionPlan) {}

  async run(
    context: WorkflowContext,
    onProgress?: WorkflowProgressListener,
    onHistory?: WorkflowHistoryListener,
    onStepEvent?: WorkflowStepEventListener,
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

      onStepEvent?.({
        type: 'step',
        stepId: step.name,
        status: 'running',
        startedAt: startedAt.toISOString(),
      });

      try {
        current = await step.run(current);
      } catch (error) {
        const completedAt = new Date();
        const errorCode = error instanceof Error ? error.name : 'UnknownError';
        const errorMessage = error instanceof Error ? error.message : String(error);
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
            errorMessage,
          },
        });
        onHistory?.({
          stepId: step.name,
          status: 'failure',
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
          durationMs: completedAt.getTime() - startedAt.getTime(),
          errorCode,
          errorMessage,
        });
        onStepEvent?.({
          type: 'step',
          stepId: step.name,
          status: 'failed',
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
          durationMs: completedAt.getTime() - startedAt.getTime(),
          errorCode,
          errorMessage,
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

      onStepEvent?.({
        type: 'step',
        stepId: step.name,
        status: 'completed',
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
