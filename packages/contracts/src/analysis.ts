export type RuleOutcome = 'pass' | 'fail';

export interface Finding {
  id: string;
  auditId: string;
  ruleId: string;
  category: string;
  sourceEngine: string;
  outcome: RuleOutcome;
  evidence: Record<string, unknown>;
}

export interface AnalysisResult {
  findings: Finding[];
}

export interface FindingSummary {
  id: string;
  ruleId: string;
  category: string;
  sourceEngine: string;
  outcome: RuleOutcome;
  evidence: Record<string, unknown>;
}

export interface AnalysisSummary {
  findings: FindingSummary[];
}
