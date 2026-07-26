import type { OptimizationLevel } from './optimization-plan';
import type { ReasoningModel } from './reasoning-model';
import type { ImpactAssessment } from './impact-assessment';
import type { CoverageLevel, VisibilityScoreTrend, VisibilityStatus } from './ai-visibility';
import type { CycleStatus } from './optimization-cycle';

export interface ReportEvidenceFact {
  label: string;
  value: string;
}

export interface ReportFindingReference {
  findingId: string;
  ruleId: string;
  category: string;
  sourceEngine: string;
  outcome: string;
}

export interface ReportOptimizationRuleReference {
  ruleId: string;
  ruleVersion: string;
  category: string;
}

export interface ReportConclusion {
  statement: string;
  evidence: ReportEvidenceFact[];
  relatedFindings: ReportFindingReference[];
  relatedOptimizationRules: ReportOptimizationRuleReference[];
  reasoning: ReasoningModel | null;
  confidence: OptimizationLevel;
}

export interface ReportInitialSituation {
  auditId: string;
  url: string;
  aiVisibilityStatus: VisibilityStatus | null;
  assessedAt: string | null;
  summary: string;
}

export interface ReportAiVisibilityProgress {
  baselineStatus: VisibilityStatus;
  verificationStatus: VisibilityStatus;
  trend: VisibilityScoreTrend;
  entityCoverageChange: {
    baseline: CoverageLevel;
    verification: CoverageLevel;
  };
}

export interface ExecutiveClientReport {
  reportVersion: string;
  generatedAt: string;
  cycleId: string;
  cycleGoal: string;
  cycleStatus: CycleStatus;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  executiveSummary: string;
  initialSituation: ReportInitialSituation | null;
  keyFindings: ReportConclusion[];
  actionsCompleted: ReportConclusion[];
  improvementsAchieved: ReportConclusion[];
  impactAssessmentSummary: ImpactAssessment | null;
  aiVisibilityProgress: ReportAiVisibilityProgress | null;
  evidence: ReportEvidenceFact[];
  risks: ReportConclusion[];
  recommendedNextCycleGoals: ReportConclusion[];
}
