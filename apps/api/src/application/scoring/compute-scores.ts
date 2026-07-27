import type { CategoryScore, CategoryScoreStatus, Finding, Scores } from '@ai-visibility/contracts';
import { resolveOptimizationRule } from '../optimization-knowledge-base/optimization-knowledge-base';

type ScoreKey = keyof Omit<Scores, 'overall'>;

const CATEGORY_TO_SCORE_KEY: Record<string, ScoreKey> = {
  seo: 'seo',
  'ai-visibility': 'aiVisibility',
  technical: 'technical',
  content: 'content',
  accessibility: 'accessibility',
  performance: 'performance',
};

const SCORE_KEYS: ScoreKey[] = ['seo', 'aiVisibility', 'technical', 'content', 'accessibility', 'performance'];

// A category needs at least this many real (non-skipped) Rule evaluations before its score is
// trusted as an 'ok' signal rather than flagged 'incomplete' — one binary check alone can only
// ever land on 0 or 100, which reads as far more certain than a single check actually is.
const MINIMUM_EVALUATED_RULES = 2;

function describeFinding(finding: Finding): string {
  return resolveOptimizationRule(finding.ruleId)?.title ?? finding.ruleId;
}

function statusFor(evaluatedRules: number): CategoryScoreStatus {
  if (evaluatedRules === 0) {
    return 'insufficient-data';
  }
  return evaluatedRules < MINIMUM_EVALUATED_RULES ? 'incomplete' : 'ok';
}

function scoreCategory(categoryFindings: ReadonlyArray<Finding>): CategoryScore {
  const passedChecks: string[] = [];
  const issues: string[] = [];
  const warnings: string[] = [];
  let passedRules = 0;
  let failedRules = 0;
  let skippedRules = 0;

  for (const finding of categoryFindings) {
    if (finding.outcome === 'skip') {
      skippedRules += 1;
      continue;
    }

    if (finding.outcome === 'pass') {
      passedRules += 1;
      passedChecks.push(describeFinding(finding));
      continue;
    }

    failedRules += 1;
    const rule = resolveOptimizationRule(finding.ruleId);
    if (rule?.severity === 'low') {
      warnings.push(describeFinding(finding));
    } else {
      issues.push(describeFinding(finding));
    }
  }

  const evaluatedRules = passedRules + failedRules;
  // Never fabricated: a category with zero evaluated Rules gets `score: null`, never a numeric
  // default (including never 100) — the UI renders this as "Insufficient Data," not a perfect score.
  const score = evaluatedRules === 0 ? null : Math.round((passedRules / evaluatedRules) * 100);

  return {
    score,
    status: statusFor(evaluatedRules),
    evaluatedRules,
    passedRules,
    failedRules,
    skippedRules,
    issues,
    warnings,
    passedChecks,
  };
}

// A pure projection over Findings, recomputed on every read — never persisted, matching the
// existing Optimization Plan / Executive Dashboard precedent. Findings whose rule category is
// 'execution' (the pipeline-health rules) don't map to a user-facing score category and are
// intentionally excluded.
export function computeScores(findings: ReadonlyArray<Finding>): Scores {
  const byCategory = new Map<ScoreKey, Finding[]>();
  for (const key of SCORE_KEYS) {
    byCategory.set(key, []);
  }

  for (const finding of findings) {
    const scoreKey = CATEGORY_TO_SCORE_KEY[finding.category];
    if (scoreKey) {
      byCategory.get(scoreKey)!.push(finding);
    }
  }

  const categoryScores = {} as Record<ScoreKey, CategoryScore>;
  for (const key of SCORE_KEYS) {
    categoryScores[key] = scoreCategory(byCategory.get(key)!);
  }

  // Overall only ever averages categories with a real score — a category with no evaluated Rules
  // (score: null) is excluded outright rather than counted as 0 or 100, so it can neither drag
  // down nor artificially inflate the Overall Score.
  const scoredCategories = SCORE_KEYS.map((key) => categoryScores[key].score).filter(
    (score): score is number => score !== null,
  );
  const overall =
    scoredCategories.length === 0
      ? null
      : Math.round(scoredCategories.reduce((total, score) => total + score, 0) / scoredCategories.length);

  return { ...categoryScores, overall } as Scores;
}
