import { AuditContext } from './audit-context';
import { WorkflowResult } from './workflow-result';

export interface WorkflowContext extends AuditContext {
  readonly results: WorkflowResult;
}
