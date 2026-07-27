import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { Heuristic, HeuristicScope } from '@ai-visibility/contracts';

// Insert-only, mirroring Signals' append model: this engine is invoked once per scope per
// audit (core, then later ai-visibility), so each invocation gets its own row rather than
// updating a single per-audit row.
export async function saveHeuristics(auditId: string, scope: HeuristicScope, heuristics: Heuristic[]): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  await prisma.heuristicResult.create({
    data: {
      auditId,
      scope,
      heuristics: heuristics as object,
    },
  });
}
