import type { Finding } from './analysis';
import type { AnalysisSignal } from './signal';
import type { Heuristic } from './heuristic';

// A category's evaluation coverage, always reported regardless of status — this is what lets a
// consumer distinguish "scored 100 because every evaluated Rule passed" from "no Rule ever ran."
export interface CategoryScoreCoverage {
  totalRules: number;
  evaluatedRules: number;
  passedRules: number;
  failedRules: number;
  skippedRules: number;
}

// 'ok': evaluatedRules >= the minimum required for this category (see MINIMUM_EVALUATED_RULES in
// compute-scores.ts) — score is a real, adequately-sampled pass rate.
// 'incomplete': 1..(minimum-1) Rules evaluated — score is still real (never fabricated), but
// backed by too few checks to be a confident signal; consumers should visibly flag this.
// 'insufficient-data': zero Rules evaluated for this category — there is no real signal to score
// at all, so `score` is null rather than defaulting to any number.
export type CategoryScoreStatus = 'ok' | 'incomplete' | 'insufficient-data';

// The same pass/fail/severity decision compute-scores.ts already makes to sort a Finding into
// its category's issues/warnings/passedChecks — exposed per-Rule so any consumer (e.g. a Page
// Detail screen grouping Rules by topic rather than by score category) can classify a Finding
// without re-deriving the decision. 'issue': failed, not a low-severity Optimization Rule.
// 'warning': failed, low-severity Optimization Rule. 'passed': outcome 'pass'. 'skipped': outcome
// 'skip' — the Rule's Heuristic never ran, so it is neither a pass nor a failure.
export type RuleClassification = 'passed' | 'issue' | 'warning' | 'skipped';

// The full explainability chain for one Rule, in the order a consumer should drill into it:
// Rule (ruleId/ruleVersion/outcome, on `finding`) -> Finding (`finding` itself, id/category/
// sourceEngine) -> Heuristic (`heuristic`, the real Heuristic this Rule reads — its own key/
// version/category, distinct from the Rule's) -> Signals (`signals`, the real AnalysisSignals
// that fed that Heuristic) -> Evidence (`finding.evidence`). Every field is data already produced
// by the real pipeline — nothing here is synthesized for display. `heuristic` is `null` only for
// the three `*-execution` Rules, which check engine status directly rather than reading a
// Heuristic — an honest gap, not a missing lookup.
export interface RuleExplanation {
  finding: Finding;
  heuristic: Heuristic | null;
  signals: AnalysisSignal[];
  classification: RuleClassification;
}

export interface CategoryScore extends CategoryScoreCoverage {
  score: number | null;
  status: CategoryScoreStatus;
  issues: string[];
  warnings: string[];
  passedChecks: string[];
  rules: RuleExplanation[];
}

export interface Scores {
  seo: CategoryScore;
  aiVisibility: CategoryScore;
  technical: CategoryScore;
  content: CategoryScore;
  accessibility: CategoryScore;
  performance: CategoryScore;
  // null only when every category is 'insufficient-data' (score: null) — never a fabricated
  // average that includes a category with no real evaluated Rules.
  overall: number | null;
}
