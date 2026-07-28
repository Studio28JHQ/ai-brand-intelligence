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

// No `statement` here: `messageKey` (a `rules` i18n domain key, e.g. `catalog.<ruleId>.rationale`
// or `templates.<name>`) plus `parameters` is what the presentation layer resolves into a localized
// sentence — see `docs/04_PROJECT/DECISION_LOG.md#cto-111`.
export interface ReportConclusion {
  messageKey: string;
  parameters: Record<string, string | number>;
  evidence: ReportEvidenceFact[];
  relatedFindings: ReportFindingReference[];
  relatedOptimizationRules: ReportOptimizationRuleReference[];
  reasoning: ReasoningModel | null;
  confidence: OptimizationLevel;
}

// No `summary` here: `actionableFindingsCount` plus the fields already present (`aiVisibilityStatus`,
// the report's own `projectName`) is what the presentation layer composes into a localized sentence
// — see `docs/04_PROJECT/DECISION_LOG.md#cto-111`.
export interface ReportInitialSituation {
  auditId: string;
  url: string;
  aiVisibilityStatus: VisibilityStatus | null;
  assessedAt: string | null;
  actionableFindingsCount: number;
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
  initialSituation: ReportInitialSituation | null;
  keyFindings: ReportConclusion[];
  actionsCompleted: ReportConclusion[];
  improvementsAchieved: ReportConclusion[];
  impactAssessmentSummary: ImpactAssessment | null;
  aiVisibilityProgress: ReportAiVisibilityProgress | null;
  // `label` here is one of a fixed, closed set of stable keys (never English prose) — see
  // `EVIDENCE_LABEL_KEYS` in `apps/web/app/(shell)/projects/[id]/cycles/[cycleId]/report/page.tsx`,
  // resolved via `reports.evidenceLabels.<key>`.
  evidence: ReportEvidenceFact[];
  risks: ReportConclusion[];
  recommendedNextCycleGoals: ReportConclusion[];
}
