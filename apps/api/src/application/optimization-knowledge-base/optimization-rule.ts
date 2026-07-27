import type { OptimizationLevel } from '@ai-visibility/contracts';

export interface OptimizationRuleVersion {
  ruleId: string;
  version: string;
  category: string;
  severity: OptimizationLevel;
  title: string;
  businessRationale: string;
  resolutionStrategy: string;
  expectedImpact: OptimizationLevel;
  evidenceReferences: string[];
  publishedAt: string;
}

export interface OptimizationRuleDefinition {
  ruleId: string;
  enabled: boolean;
  // Append-only, oldest first — the last entry is always the current version.
  versions: OptimizationRuleVersion[];
}
