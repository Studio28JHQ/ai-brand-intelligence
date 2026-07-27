import type { Finding } from './analysis';
import type { OptimizationItem } from './optimization-plan';
import type { Scores } from './scores';

export interface AuditAnalysisView {
  auditId: string;
  findings: Finding[];
  optimizationPlan: OptimizationItem[];
  scores: Scores;
}
