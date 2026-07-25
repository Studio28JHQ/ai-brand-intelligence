export type FindingStatus = 'success' | 'failure';

export interface Finding {
  id: string;
  auditId: string;
  category: string;
  sourceEngine: string;
  status: FindingStatus;
}

export interface AnalysisResult {
  findings: Finding[];
}

export interface FindingSummary {
  id: string;
  category: string;
  sourceEngine: string;
  status: FindingStatus;
}

export interface AnalysisSummary {
  findings: FindingSummary[];
}
