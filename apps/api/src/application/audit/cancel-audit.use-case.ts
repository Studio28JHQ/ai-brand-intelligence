import { Inject, Injectable } from '@nestjs/common';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { AuditNotCancellableError, AuditNotFoundError } from '../../domain/audit/audit.errors';
import { AuditProgressPublisher } from '../../infrastructure/audit/audit-progress-publisher';

// Only a 'queued' or 'pending' Audit can be honestly cancelled — neither has a process actually
// executing yet, so this is a pure status flip. A 'running' Audit's pipeline has no interrupt
// mechanism (F10-S04E, see docs/04_PROJECT/DECISION_LOG.md#cto-107); cancelling it would only lie
// about its state, not stop it, so it's rejected rather than faked.
@Injectable()
export class CancelAuditUseCase {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly progressPublisher: AuditProgressPublisher,
  ) {}

  async execute(auditId: string): Promise<Audit> {
    const audit = await this.auditRepository.findById(auditId);
    if (!audit) {
      throw new AuditNotFoundError(auditId);
    }
    if (audit.status !== 'queued' && audit.status !== 'pending') {
      throw new AuditNotCancellableError(auditId, audit.status);
    }

    const cancelled = await this.auditRepository.markCancelled(auditId, new Date());
    // A cancelled 'queued' Audit is simply never picked up by startNextQueuedAudit's
    // status === 'queued' filter — no separate dequeue step needed.
    this.progressPublisher.publish(auditId, {
      type: 'audit',
      status: cancelled.status,
      timestamp: new Date().toISOString(),
    });
    return cancelled;
  }
}
