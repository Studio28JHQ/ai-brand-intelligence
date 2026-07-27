import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import type { Heuristic } from '@ai-visibility/contracts';
import { PRISMA_CLIENT } from '../database/database.module';

// The Heuristics Engine persists one row per scope invocation (core, then later ai-visibility —
// `services/heuristics/src/heuristics-repository.ts`). Every Heuristic key is unique across both
// scopes (each Combinator only ever matches one scope's Signal pool), so flattening both rows'
// `heuristics` arrays into one list is safe — no key can collide.
@Injectable()
export class HeuristicReadRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async findByAuditId(auditId: string): Promise<Heuristic[]> {
    const records = await this.prisma.heuristicResult.findMany({ where: { auditId } });
    return records.flatMap((record) => record.heuristics as unknown as Heuristic[]);
  }
}
