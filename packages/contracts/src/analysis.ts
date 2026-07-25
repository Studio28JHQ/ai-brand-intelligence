export type RuleOutcome = 'pass' | 'fail';

export type FindingSeverity = 'none' | 'warning';

export interface Finding {
  id: string;
  auditId: string;
  ruleId: string;
  ruleVersion: string;
  category: string;
  sourceEngine: string;
  outcome: RuleOutcome;
  severity: FindingSeverity;
  evidence: Record<string, unknown>;
}

export interface AnalysisResult {
  findings: Finding[];
  ruleSetVersion: string;
}

export interface FindingSummary {
  id: string;
  ruleId: string;
  ruleVersion: string;
  category: string;
  sourceEngine: string;
  outcome: RuleOutcome;
  severity: FindingSeverity;
  evidence: Record<string, unknown>;
}

export interface AnalysisSummary {
  findings: FindingSummary[];
  ruleSetVersion: string;
}
