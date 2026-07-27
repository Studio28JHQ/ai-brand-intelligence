import type { AnalysisSignal, OptimizationItem, RuleExplanation } from '@ai-visibility/contracts';
import { Badge } from './ui';

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
export function RecommendationExplainability({ item, rule }: { item: OptimizationItem; rule: RuleExplanation | undefined }) {
  if (!rule) {
    return (
      <details className="score-card__expand">
        <summary>Finding → Rule → Heuristic → Signals → Evidence</summary>
        <p className="text-secondary">
          No explainability chain available — this Recommendation's triggering Finding could not be located in this Audit's Scores.
        </p>
      </details>
    );
  }

  return (
    <details className="score-card__expand">
      <summary>Finding → Rule → Heuristic → Signals → Evidence</summary>
      <div className="stack">
        <dl className="dl">
          <dt>Finding</dt>
          <dd className="text-mono">{rule.finding.id}</dd>
          <dt>Rule</dt>
          <dd>{rule.finding.ruleId}</dd>
          <dt>Rule Version</dt>
          <dd>{rule.finding.ruleVersion}</dd>
          <dt>Heuristic</dt>
          <dd>
            {rule.heuristic ? (
              <>
                {rule.heuristic.key} <span className="text-tertiary">v{rule.heuristic.version}</span>
              </>
            ) : (
              <span className="text-tertiary">N/A — no Heuristic backs this Rule; it checks engine status directly.</span>
            )}
          </dd>
          <dt>Confidence</dt>
          <dd>
            <Badge variant="primary">{item.reasoning.confidence}</Badge>
          </dd>
        </dl>

        <div>
          <p className="score-explain__label">Evidence</p>
          <pre className="text-mono">{JSON.stringify(rule.finding.evidence, null, 2)}</pre>
        </div>

        <div>
          <p className="score-explain__label">Signals (Raw Values)</p>
          {rule.signals.length === 0 ? (
            <p className="text-secondary">
              No Signals to show — this Rule's Heuristic did not run, so there is nothing real to attribute.
            </p>
          ) : (
            rule.signals.map((signal) => <SignalCard key={signal.signalId} signal={signal} />)
          )}
        </div>
      </div>
    </details>
  );
}
