import type { WorkflowResult } from '@ai-visibility/contracts';
import { AuditContext } from './audit-context';
import { ExecutionMetadata } from './execution-metadata';

export interface WorkflowContext extends AuditContext {
  readonly workflowId: string;
  readonly metadata: ExecutionMetadata;
  readonly results: WorkflowResult;
}
