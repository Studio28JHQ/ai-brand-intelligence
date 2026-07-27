import type { AnalysisSignal } from './signal';

export type VisibilityStatus = 'ready' | 'needs-improvement' | 'not-ready';

export type VisibilityScoreTrend = 'improved' | 'declined' | 'unchanged' | 'unknown';

export type CompletenessLevel = 'complete' | 'partial' | 'incomplete';

export type CoverageLevel = 'covered' | 'partial' | 'none';

export interface AiVisibilityAssessment {
  auditId: string;
  status: VisibilityStatus;
  graphCompleteness: CompletenessLevel;
  entityCoverage: CoverageLevel;
  relationshipCoverage: CoverageLevel;
  missingSignals: string[];
  assessedAt: string;
}

export interface AiVisibilityResult {
  assessment: AiVisibilityAssessment;
  signals: AnalysisSignal[];
}

export interface AiVisibilitySummary {
  status: VisibilityStatus;
  graphCompleteness: CompletenessLevel;
  entityCoverage: CoverageLevel;
  relationshipCoverage: CoverageLevel;
  missingSignals: string[];
  assessedAt: string;
}
