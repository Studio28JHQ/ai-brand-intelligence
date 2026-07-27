// A category's evaluation coverage, always reported regardless of status — this is what lets a
// consumer distinguish "scored 100 because every evaluated Rule passed" from "no Rule ever ran."
export interface CategoryScoreCoverage {
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

export interface CategoryScore extends CategoryScoreCoverage {
  score: number | null;
  status: CategoryScoreStatus;
  issues: string[];
  warnings: string[];
  passedChecks: string[];
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
