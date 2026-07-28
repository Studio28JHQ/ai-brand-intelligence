import type { AnalysisSignal, CategoryScore, Finding, RuleExplanation, Scores } from '@ai-visibility/contracts';
import { Badge, Card, statusToVariant } from './ui';
import { getTranslations } from '../../lib/i18n/server';
import type { Translator } from '@ai-visibility/i18n';
import { ruleTitle } from '../lib/rule-text';

const CATEGORY_LABEL_KEYS: Record<Exclude<keyof Scores, 'overall'>, string> = {
  seo: 'categorySeo',
  aiVisibility: 'categoryAiVisibility',
  technical: 'categoryTechnical',
  content: 'categoryContent',
  accessibility: 'categoryAccessibility',
  performance: 'categoryPerformance',
};

const CATEGORY_KEYS = Object.keys(CATEGORY_LABEL_KEYS) as Array<Exclude<keyof Scores, 'overall'>>;

function scoreVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 80) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}

function ScoreBadge({ score, t }: { score: number | null; t: Translator }) {
  if (score === null) {
    return <Badge variant="neutral">{t('insufficientData')}</Badge>;
  }
  return <Badge variant={scoreVariant(score)}>{`${score}/100`}</Badge>;
}

function CoverageLine({ category, t, tCommon }: { category: CategoryScore; t: Translator; tCommon: Translator }) {
  return (
    <dl className="dl">
      <dt>{t('totalRules')}</dt>
      <dd>{category.totalRules}</dd>
      <dt>{t('evaluated')}</dt>
      <dd>{category.evaluatedRules}</dd>
      <dt>{t('passed')}</dt>
      <dd>{category.passedRules}</dd>
      <dt>{tCommon('statusValues.failed')}</dt>
      <dd>{category.failedRules}</dd>
      <dt>{t('skipped')}</dt>
      <dd>{category.skippedRules}</dd>
    </dl>
  );
}

function SignalCard({ signal }: { signal: AnalysisSignal }) {
  return (
    <div className="score-explain__signal">
      <p>
        <strong>{signal.key}</strong> <span className="text-tertiary">({signal.category}, via {signal.sourceId})</span>
      </p>
      <pre className="text-mono">{JSON.stringify(signal.data, null, 2)}</pre>
    </div>
  );
}

function FindingExplanation({ finding, t, tCommon }: { finding: Finding; t: Translator; tCommon: Translator }) {
  return (
    <>
      <div className="score-explain__layer">
        <p className="score-explain__label">{t('findingLabel')}</p>
        <p className="text-secondary">
          {finding.id} — {t('outcome')} <Badge variant={statusToVariant(finding.outcome)}>{t(finding.outcome)}</Badge> —{' '}
          {t('severity')} <Badge variant={statusToVariant(finding.severity)}>{tCommon(`statusValues.${finding.severity}`)}</Badge>
        </p>
      </div>
      <div className="score-explain__layer">
        <p className="score-explain__label">{t('evidence')}</p>
        <pre className="text-mono">{JSON.stringify(finding.evidence, null, 2)}</pre>
      </div>
    </>
  );
}

function RuleExplanationCard({ rule, t, tCommon }: { rule: RuleExplanation; t: Translator; tCommon: Translator }) {
  const { finding, signals } = rule;
  return (
    <div className="score-explain__rule">
      <p>
        <strong>{finding.ruleId}</strong> <span className="text-tertiary">v{finding.ruleVersion}</span>{' '}
        <Badge variant={statusToVariant(finding.outcome)}>{t(finding.outcome)}</Badge>
      </p>
      <FindingExplanation finding={finding} t={t} tCommon={tCommon} />
      <div className="score-explain__layer">
        <p className="score-explain__label">{t('signalsCount', { count: signals.length })}</p>
        {signals.length === 0 ? (
          <p className="text-secondary">{t('noSignalsToShow')}</p>
        ) : (
          signals.map((signal) => <SignalCard key={signal.signalId} signal={signal} />)
        )}
      </div>
    </div>
  );
}

function CategoryExplainability({ category, t, tCommon }: { category: CategoryScore; t: Translator; tCommon: Translator }) {
  if (category.rules.length === 0) {
    return null;
  }
  return (
    <details className="score-card__expand">
      <summary>{t('rulesFindingsEvidenceSignals', { count: category.rules.length })}</summary>
      <div className="score-explain">
        {category.rules.map((rule) => (
          <RuleExplanationCard key={rule.finding.id} rule={rule} t={t} tCommon={tCommon} />
        ))}
      </div>
    </details>
  );
}

export async function ScoresPanel({ scores }: { scores: Scores }) {
  const t = await getTranslations('findings');
  const tCommon = await getTranslations('common');
  const tRules = await getTranslations('rules');

  return (
    <Card
      title={t('scoresTitle')}
      description={t('scoresDescription')}
      actions={
        <Badge variant={scores.overall === null ? 'neutral' : scoreVariant(scores.overall)}>
          {scores.overall === null ? t('insufficientData') : t('overallSuffix', { score: scores.overall })}
        </Badge>
      }
    >
      <div className="grid-3">
        {CATEGORY_KEYS.map((key) => {
          const category = scores[key];
          const issueRules = category.rules.filter((rule) => rule.classification === 'issue');
          const warningRules = category.rules.filter((rule) => rule.classification === 'warning');
          const passedCount = category.rules.filter((rule) => rule.classification === 'passed').length;
          return (
            <Card key={key} muted title={t(CATEGORY_LABEL_KEYS[key])} actions={<ScoreBadge score={category.score} t={t} />}>
              <CoverageLine category={category} t={t} tCommon={tCommon} />
              {category.status === 'incomplete' && <p className="text-secondary">{t('categoryIncomplete')}</p>}
              {category.status === 'insufficient-data' && <p className="text-secondary">{t('categoryInsufficientData')}</p>}
              {issueRules.length === 0 && warningRules.length === 0 && category.evaluatedRules > 0 && (
                <p className="text-secondary">{t('noIssuesFound', { count: passedCount })}</p>
              )}
              {issueRules.length > 0 && (
                <div>
                  <p className="text-secondary">{t('issues')}</p>
                  <ul>
                    {issueRules.map((rule) => (
                      <li key={rule.finding.id}>{ruleTitle(tRules, rule.finding.ruleId)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {warningRules.length > 0 && (
                <div>
                  <p className="text-secondary">{t('warnings')}</p>
                  <ul>
                    {warningRules.map((rule) => (
                      <li key={rule.finding.id}>{ruleTitle(tRules, rule.finding.ruleId)}</li>
                    ))}
                  </ul>
                </div>
              )}
              <CategoryExplainability category={category} t={t} tCommon={tCommon} />
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

export async function ScoresSummaryBadge({ scores }: { scores: Scores | null }) {
  const t = await getTranslations('findings');
  if (!scores || scores.overall === null) {
    return <Badge variant="neutral">{t('noScoreYet')}</Badge>;
  }
  return <Badge variant={scoreVariant(scores.overall)}>{`${scores.overall}/100`}</Badge>;
}
