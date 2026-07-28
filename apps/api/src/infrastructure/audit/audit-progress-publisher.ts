import { EventEmitter } from 'node:events';
import { Injectable } from '@nestjs/common';
import type { AuditProgressEvent, AuditStatus, AuditStepProgressEvent } from '@ai-visibility/contracts';

export function isTerminalAuditStatus(status: AuditStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

interface AuditProgressState {
  auditStatus: AuditStatus | null;
  steps: Map<string, AuditStepProgressEvent>;
}

export interface AuditProgressSnapshot {
  auditStatus: AuditStatus | null;
  steps: AuditStepProgressEvent[];
}

// A single Node process runs this platform's entire Workflow Runtime end to end — no queue, no
// worker pool (see docs/04_PROJECT/DECISION_LOG.md#cto-104) — so an in-memory event bus keyed by
// auditId is a genuine, correct source of live progress: the process publishing a step transition
// is the same process any SSE subscriber connects to. Nothing here is persisted; a process restart
// mid-audit loses nothing meaningful, since the (synchronous-per-audit) pipeline would need to be
// re-run from scratch regardless.
@Injectable()
export class AuditProgressPublisher {
  private readonly emitter = new EventEmitter();
  private readonly state = new Map<string, AuditProgressState>();

  publish(auditId: string, event: AuditProgressEvent): void {
    const current = this.state.get(auditId) ?? { auditStatus: null, steps: new Map<string, AuditStepProgressEvent>() };
    if (event.type === 'audit') {
      current.auditStatus = event.status;
    } else {
      current.steps.set(event.stepId, event);
    }
    this.state.set(auditId, current);

    this.emitter.emit(auditId, event);

    if (event.type === 'audit' && isTerminalAuditStatus(event.status)) {
      // The database is authoritative for a finished audit and nothing further will ever be
      // published for this auditId — free the in-memory entry.
      this.state.delete(auditId);
    }
  }

  getSnapshot(auditId: string): AuditProgressSnapshot {
    const current = this.state.get(auditId);
    return { auditStatus: current?.auditStatus ?? null, steps: current ? [...current.steps.values()] : [] };
  }

  subscribe(auditId: string, listener: (event: AuditProgressEvent) => void): () => void {
    this.emitter.on(auditId, listener);
    return () => {
      this.emitter.off(auditId, listener);
    };
  }
}
