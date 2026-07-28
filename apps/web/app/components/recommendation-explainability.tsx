import type { AnalysisSignal, OptimizationItem, RuleExplanation } from '@ai-visibility/contracts';
import { Badge, statusToVariant } from './ui';
import { getTranslations } from '../../lib/i18n/server';

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

// Every recommendation shall expose Finding -> Rule -> Heuristic -> Signals -> Evidence, expanded
// on demand, never hidden once expanded: this is the single shared component every Recommendation
// surface (Audit Detail, Page Detail sections, the Executive Dashboard's Priority Actions) uses,
// so the chain can never render differently — or go missing — in one place versus another.
// Entirely deterministic data already computed by compute-scores.ts; no AI provider involved.
export async function RecommendationExplainability({
  item,
  rule,
}: {
  item: OptimizationItem;
  rule: RuleExplanation | undefined;
}) {
  const t = await getTranslations('findings');
  const tCommon = await getTranslations('common');

  if (!rule) {
    return (
      <details className="score-card__expand">
        <summary>{t('explainabilityChainTitle')}</summary>
        <p className="text-secondary">{t('noExplainabilityChain')}</p>
      </details>
    );
  }

  return (
    <details className="score-card__expand">
      <summary>{t('explainabilityChainTitle')}</summary>
      <div className="stack">
        <dl className="dl">
          <dt>{t('findingLabel')}</dt>
          <dd className="text-mono">{rule.finding.id}</dd>
          <dt>{t('rule')}</dt>
          <dd>{rule.finding.ruleId}</dd>
          <dt>{t('ruleVersionLabel')}</dt>
          <dd>{rule.finding.ruleVersion}</dd>
          <dt>{t('heuristicLabel')}</dt>
          <dd>
            {rule.heuristic ? (
              <>
                {rule.heuristic.key} <span className="text-tertiary">v{rule.heuristic.version}</span>
              </>
            ) : (
              <span className="text-tertiary">{t('heuristicNotApplicable')}</span>
            )}
          </dd>
          <dt>{t('confidenceLabel')}</dt>
          <dd>
            <Badge variant={statusToVariant(item.reasoning.confidence)}>
              {tCommon(`statusValues.${item.reasoning.confidence}`)}
            </Badge>
          </dd>
        </dl>

        <div>
          <p className="score-explain__label">{t('evidence')}</p>
          <pre className="text-mono">{JSON.stringify(rule.finding.evidence, null, 2)}</pre>
        </div>

        <div>
          <p className="score-explain__label">{t('signalsRawValues')}</p>
          {rule.signals.length === 0 ? (
            <p className="text-secondary">{t('noSignalsToShow')}</p>
          ) : (
            rule.signals.map((signal) => <SignalCard key={signal.signalId} signal={signal} />)
          )}
        </div>
      </div>
    </details>
  );
}
