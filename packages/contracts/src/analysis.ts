// 'skip': the Rule's required upstream Signal/Heuristic was not present, so it never reached a
// real pass/fail judgment — distinct from 'fail' (the check ran and did not pass).
export type RuleOutcome = 'pass' | 'fail' | 'skip';

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
