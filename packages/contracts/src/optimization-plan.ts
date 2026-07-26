import type { ReasoningModel } from './reasoning-model';

export type OptimizationLevel = 'low' | 'medium' | 'high';

export type OptimizationPriority = OptimizationLevel;

export type OptimizationItemStatus = 'open';

export interface OptimizationItem {
  title: string;
  description: string;
  rationale: string;
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
