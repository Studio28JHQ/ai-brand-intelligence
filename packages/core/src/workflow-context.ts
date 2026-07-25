import type { WorkflowResult } from '@ai-visibility/contracts';
import { AuditContext } from './audit-context';

export interface WorkflowContext extends AuditContext {
  readonly results: WorkflowResult;
}
