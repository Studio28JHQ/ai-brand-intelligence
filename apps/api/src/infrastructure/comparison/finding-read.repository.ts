import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { Finding } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

export interface RuleOccurrenceAggregate {
  ruleId: string;
  occurrenceCount: number;
  distinctProjectCount: number;
}

@Injectable()
export class FindingReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findByAuditId(auditId: string): Promise<Finding[]> {
    const records = await this.prisma.finding.findMany({ where: { auditId } });
    return records.map((record) => ({
      id: record.id,
      auditId: record.auditId,
      ruleId: record.ruleId,
      ruleVersion: record.ruleVersion,
      category: record.category,
      sourceEngine: record.sourceEngine,
      outcome: record.outcome as Finding['outcome'],
      severity: record.severity as Finding['severity'],
      evidence: record.evidence as Record<string, unknown>,
    }));
  }

  /**
   * Cross-Project aggregate only — deliberately returns nothing more granular than a rule id and
   * two counts. This is the one place in the codebase allowed to look across every Project's
   * Findings at once (for Optimization Pattern discovery); it must never grow a variant that
   * returns per-Project or per-Client detail alongside the aggregate.
   */
  async aggregateActionableFindingsByRule(): Promise<RuleOccurrenceAggregate[]> {
    return this.prisma.$queryRaw<RuleOccurrenceAggregate[]>`
      SELECT f.rule_id AS "ruleId",
             COUNT(*)::int AS "occurrenceCount",
             COUNT(DISTINCT a.project_id)::int AS "distinctProjectCount"
      FROM findings f
      JOIN audit_requests a ON a.id = f.audit_id
      WHERE f.severity != 'none'
      GROUP BY f.rule_id
    `;
  }
}
