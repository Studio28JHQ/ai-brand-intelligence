import { AuditContext } from './audit-context';
import { PipelineResults } from './pipeline-results';

export interface Engine<TResult = unknown> {
  readonly name: string;
  run(context: AuditContext, previousResults: PipelineResults): Promise<TResult>;
}
