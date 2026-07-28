'use client';

import { useState } from 'react';
import type { ConsultantAnswer, ConsultantIntentType } from '@ai-visibility/contracts';
import { askConsultant } from '../../../../actions';
import { Badge, Banner, Card, CONFIDENCE_VARIANT, EmptyState, SkeletonBlock, statusToVariant } from '../../../../components/ui';
import { useTranslations } from '../../../../../lib/i18n/client';
import type { Translator } from '@ai-visibility/i18n';

interface ConversationTurn {
  question: string;
  answer: ConsultantAnswer;
}

export function ConsultantChat({ projectId }: { projectId: string }) {
  const t = useTranslations('optimization');
  const tCommon = useTranslations('common');
  const tFindings = useTranslations('findings');
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const PRESET_QUESTIONS: { intentType: ConsultantIntentType; question: string }[] = [
    { intentType: 'why', question: t('presetWhy') },
    { intentType: 'what-should-i-do-first', question: t('presetWhatFirst') },
    { intentType: 'what-changed', question: t('presetWhatChanged') },
    { intentType: 'what-is-blocking-visibility', question: t('presetWhatBlocking') },
  ];

  const ask = async (intentType: ConsultantIntentType, question: string) => {
    setLoading(true);
    setError(undefined);

    const answer = await askConsultant(projectId, intentType, question);

    if (!answer) {
      setError(t('failedToReachConsultant'));
      setLoading(false);
      return;
    }

    setHistory((prev) => [...prev, { question, answer }]);
    setLoading(false);
  };

  const handleCustomAsk = () => {
    if (customQuestion.trim().length === 0) {
      return;
    }
    ask('general-question', customQuestion.trim());
    setCustomQuestion('');
  };

  return (
    <div className="stack">
      <Card>
        <div className="cluster">
          {PRESET_QUESTIONS.map((preset) => (
            <button
              key={preset.intentType}
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={loading}
              onClick={() => ask(preset.intentType, preset.question)}
            >
              {preset.question}
            </button>
          ))}
        </div>

        <div className="form-row">
          <div className="field" style={{ flex: '1 1 320px' }}>
            <label htmlFor="consultant-question" className="visually-hidden">
              {t('askQuestionLabel')}
            </label>
            <input
              className="input"
              id="consultant-question"
              type="text"
              value={customQuestion}
              onChange={(event) => setCustomQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleCustomAsk();
                }
              }}
              placeholder={t('askQuestionLabel')}
            />
          </div>
          <button type="button" className="btn btn-primary" disabled={loading} onClick={handleCustomAsk}>
            {t('ask')}
          </button>
        </div>

        {loading && <SkeletonBlock lines={2} />}
        {error && <Banner variant="error">{error}</Banner>}
      </Card>

      {history.length === 0 && !loading && (
        <EmptyState title={t('noQuestionsAskedYet')} description={t('tryPresetQuestions')} />
      )}

      <div className="stack">
        {history
          .slice()
          .reverse()
          .map((turn, index) => (
            <ConversationTurnView
              key={`${turn.answer.requestId ?? turn.answer.sessionId}-${index}`}
              turn={turn}
              t={t}
              tCommon={tCommon}
              tFindings={tFindings}
            />
          ))}
      </div>
    </div>
  );
}

function ConversationTurnView({
  turn,
  t,
  tCommon,
  tFindings,
}: {
  turn: ConversationTurn;
  t: Translator;
  tCommon: Translator;
  tFindings: Translator;
}) {
  const { answer } = turn;

  return (
    <Card>
      <p className="text-secondary">{t('questionPrefix', { question: turn.question })}</p>

      {answer.status === 'rejected' && (
        <Banner variant="error">{t('unableToAnswer', { reason: answer.rejectionReason ?? '' })}</Banner>
      )}

      {answer.status === 'unavailable' && <Banner variant="info">{t('noAnswerAvailable')}</Banner>}

      {answer.status === 'completed' && (
        <div className="stack">
          <div className="section">
            <div className="cluster">
              <h4>{t('aiInterpretation')}</h4>
              {answer.confidence && <Badge variant={CONFIDENCE_VARIANT}>{tCommon(`statusValues.${answer.confidence}`)}</Badge>}
            </div>
            <p>{answer.answer}</p>
          </div>

          <div className="section">
            <h4>{t('factsEvidence')}</h4>
            {answer.facts.length === 0 && <p className="text-secondary">{t('noSupportingFacts')}</p>}
            <ul className="stack-sm">
              {answer.facts.map((fact, index) => (
                <li key={index} className="text-secondary">
                  {fact.label}: {fact.value}
                </li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h4>{t('suggestedActions')}</h4>
            {answer.suggestedActions.length === 0 && <p className="text-secondary">{t('noSuggestedActions')}</p>}
            <ul className="stack-sm">
              {answer.suggestedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h4>{t('relatedFindings')}</h4>
            {answer.relatedFindings.length === 0 && <p className="text-secondary">{t('noRelatedFindings')}</p>}
            <ul className="stack-sm">
              {answer.relatedFindings.map((finding) => (
                <li key={finding.findingId} className="text-secondary">
                  {finding.ruleId} ({finding.sourceEngine}/{finding.category}):{' '}
                  {['pass', 'fail', 'skip'].includes(finding.outcome) ? tFindings(finding.outcome) : finding.outcome}
                </li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h4>{t('relatedOptimizationItems')}</h4>
            {answer.relatedOptimizationItems.length === 0 && <p className="text-secondary">{t('noRelatedOptimizationItems')}</p>}
            <ul className="stack-sm">
              {answer.relatedOptimizationItems.map((item) => (
                <li key={`${item.optimizationRuleId}-${item.optimizationRuleVersion}`} className="text-secondary">
                  {item.title} ({t('priorityPrefix')}
                  <Badge variant={statusToVariant(item.priority)}>{tCommon(`statusValues.${item.priority}`)}</Badge>)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
