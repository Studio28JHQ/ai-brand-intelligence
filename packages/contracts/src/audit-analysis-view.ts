import type { Finding } from './analysis';
import type { OptimizationItem } from './optimization-plan';

export interface AuditAnalysisView {
  auditId: string;
  findings: Finding[];
  optimizationPlan: OptimizationItem[];
}
