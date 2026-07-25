import { loadConfig } from '@ai-visibility/config';
import { getPrismaClient } from '@ai-visibility/database';
import type { Finding } from '@ai-visibility/contracts';

export async function saveFindings(findings: Finding[]): Promise<void> {
  const config = loadConfig();
  const prisma = getPrismaClient(config.DATABASE_URL);

  for (const finding of findings) {
    await prisma.finding.upsert({
      where: { id: finding.id },
      create: {
        id: finding.id,
        auditId: finding.auditId,
        ruleId: finding.ruleId,
        category: finding.category,
        sourceEngine: finding.sourceEngine,
        outcome: finding.outcome,
        severity: finding.severity,
        evidence: finding.evidence as object,
      },
      update: {
        ruleId: finding.ruleId,
        category: finding.category,
        sourceEngine: finding.sourceEngine,
        outcome: finding.outcome,
        severity: finding.severity,
        evidence: finding.evidence as object,
      },
    });
  }
}
