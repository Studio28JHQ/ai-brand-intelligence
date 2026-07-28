import type { ReasoningModel } from './reasoning-model';

export type OptimizationLevel = 'low' | 'medium' | 'high';

export type OptimizationPriority = OptimizationLevel;

export type OptimizationItemStatus = 'open';

// No title/description/rationale here: `optimizationRuleId` is the stable semantic identifier the
// presentation layer resolves into localized title/resolutionStrategy/rationale via the `rules`
// i18n domain (`catalog.<optimizationRuleId>.*`) — see `docs/04_PROJECT/DECISION_LOG.md#cto-111`.
// This is a pure per-request projection, never persisted with resolved text.
export interface OptimizationItem {
  expectedImpact: OptimizationLevel;
  estimatedEffort: OptimizationLevel;
  priority: OptimizationPriority;
  status: OptimizationItemStatus;
  supportingFindingIds: string[];
  projectId: string;
  auditId: string;
  cycleId: string;
  optimizationRuleId: string;
  optimizationRuleVersion: string;
  reasoning: ReasoningModel;
}

export interface OptimizationPlan {
  items: OptimizationItem[];
}
