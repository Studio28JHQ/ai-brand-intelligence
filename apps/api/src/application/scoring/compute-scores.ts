import type {
  AnalysisSignal,
  CategoryScore,
  CategoryScoreStatus,
  Finding,
  Heuristic,
  RuleClassification,
  RuleExplanation,
  Scores,
} from '@ai-visibility/contracts';
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

// The Heuristic key each scored Rule reads (see each `services/analysis/src/rules/heuristics/
// *.rule.ts`'s own `findCoreHeuristic`/`findAiVisibilityHeuristic` call) — the one piece of
// linkage needed to walk from a Rule's Finding back to the real Signals that produced it. Rules
// with no entry here (the three `*-execution` Rules) check engine status directly, not a
// Heuristic, and are excluded from scoring entirely (category `'execution'`).
const RULE_TO_HEURISTIC_KEY: Record<string, string> = {
  'seo-metadata-quality': 'metadata-quality',
  'seo-heading-structure': 'heading-structure-quality',
  'seo-content-depth': 'content-depth',
  'seo-image-accessibility': 'image-accessibility',
  'seo-structured-data': 'structured-data-coverage',
  'seo-indexability': 'indexability',
  'seo-security-posture': 'security-posture',
  'seo-technical-foundation': 'technical-foundation',
  'seo-performance-estimate': 'performance-estimate',
  'seo-internal-linking': 'internal-linking-health',
  'ai-visibility-readiness': 'ai-visibility-readiness',
};

function statusFor(evaluatedRules: number): CategoryScoreStatus {
  if (evaluatedRules === 0) {
    return 'insufficient-data';
  }
  return evaluatedRules < MINIMUM_EVALUATED_RULES ? 'incomplete' : 'ok';
}

// The single pass/fail/severity decision every consumer of a Finding's status derives from —
// computed once here so a category's issues/warnings/passedChecks and a single Rule's own
// classification (Score Explainability, F10-S02C) can never disagree with each other.
function classifyRule(finding: Finding): RuleClassification {
  if (finding.outcome === 'skip') {
    return 'skipped';
  }
  if (finding.outcome === 'pass') {
    return 'passed';
  }
  return resolveOptimizationRule(finding.ruleId)?.severity === 'low' ? 'warning' : 'issue';
}

// The Signals that actually fed the Heuristic behind this Finding — real traceability, not a
// guess: looked up through the Heuristic's own `contributingSignalKeys`, never through pattern
// matching on the Finding's category or evidence shape. Empty when the Rule was skipped (its
// Heuristic never ran, so there is honestly nothing to attribute) or, for the three execution
// Rules, when no Heuristic backs the Rule at all.
function explainRule(finding: Finding, heuristics: ReadonlyArray<Heuristic>, signals: ReadonlyArray<AnalysisSignal>): RuleExplanation {
  const heuristicKey = RULE_TO_HEURISTIC_KEY[finding.ruleId];
  const heuristic = heuristicKey ? heuristics.find((candidate) => candidate.key === heuristicKey) : undefined;
  const contributingSignals = heuristic
    ? heuristic.contributingSignalKeys
        .map((key) => signals.find((signal) => signal.key === key))
        .filter((signal): signal is AnalysisSignal => signal !== undefined)
    : [];

  return { finding, heuristic: heuristic ?? null, signals: contributingSignals, classification: classifyRule(finding) };
}

function scoreCategory(
  categoryFindings: ReadonlyArray<Finding>,
  heuristics: ReadonlyArray<Heuristic>,
  signals: ReadonlyArray<AnalysisSignal>,
): CategoryScore {
  const rules = categoryFindings.map((finding) => explainRule(finding, heuristics, signals));

  const passedRules = rules.filter((rule) => rule.classification === 'passed').length;
  const issueCount = rules.filter((rule) => rule.classification === 'issue').length;
  const warningCount = rules.filter((rule) => rule.classification === 'warning').length;
  const skippedRules = rules.filter((rule) => rule.classification === 'skipped').length;
  const failedRules = issueCount + warningCount;

  const evaluatedRules = passedRules + failedRules;
  // Never fabricated: a category with zero evaluated Rules gets `score: null`, never a numeric
  // default (including never 100) — the UI renders this as "Insufficient Data," not a perfect score.
  const score = evaluatedRules === 0 ? null : Math.round((passedRules / evaluatedRules) * 100);

  return {
    score,
    status: statusFor(evaluatedRules),
    totalRules: categoryFindings.length,
    evaluatedRules,
    passedRules,
    failedRules,
    skippedRules,
    rules,
  };
}

// A pure projection over Findings/Heuristics/Signals, recomputed on every read — never persisted,
// matching the existing Optimization Plan / Executive Dashboard precedent. Findings whose rule
// category is 'execution' (the pipeline-health rules) don't map to a user-facing score category
// and are intentionally excluded. `heuristics`/`signals` carry no scoring weight of their own —
// they exist purely so every Score is explainable down to the real data that produced it.
export function computeScores(
  findings: ReadonlyArray<Finding>,
  heuristics: ReadonlyArray<Heuristic>,
  signals: ReadonlyArray<AnalysisSignal>,
): Scores {
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
    categoryScores[key] = scoreCategory(byCategory.get(key)!, heuristics, signals);
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
