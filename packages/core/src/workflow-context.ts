import { AuditContext } from './audit-context';
import { PipelineResults } from './pipeline-results';

export interface WorkflowContext extends AuditContext {
  readonly results: PipelineResults;
}
