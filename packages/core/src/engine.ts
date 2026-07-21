import { AuditContext } from './audit-context';

export interface Engine<TResult = unknown> {
  readonly name: string;
  run(context: AuditContext): Promise<TResult>;
}
