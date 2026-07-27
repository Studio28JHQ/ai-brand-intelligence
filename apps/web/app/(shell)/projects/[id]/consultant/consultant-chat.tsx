'use client';

import { useState } from 'react';
import type { ConsultantAnswer, ConsultantIntentType } from '@ai-visibility/contracts';
import { askConsultant } from '../../../../actions';
import { Badge, Banner, Card, CONFIDENCE_VARIANT, EmptyState, SkeletonBlock } from '../../../../components/ui';

interface ConversationTurn {
  question: string;
  answer: ConsultantAnswer;
}

const PRESET_QUESTIONS: { intentType: ConsultantIntentType; question: string }[] = [
  { intentType: 'why', question: 'Why?' },
  { intentType: 'what-should-i-do-first', question: 'What should I do first?' },
  { intentType: 'what-changed', question: 'What changed?' },
  { intentType: 'what-is-blocking-visibility', question: 'What is blocking my AI Visibility?' },
];

export function ConsultantChat({ projectId }: { projectId: string }) {
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const ask = async (intentType: ConsultantIntentType, question: string) => {
    setLoading(true);
    setError(undefined);

    const answer = await askConsultant(projectId, intentType, question);

    if (!answer) {
      setError('Failed to reach the AI Consultant.');
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
              Ask a question about this Project
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
              placeholder="Ask a question about this Project"
            />
          </div>
          <button type="button" className="btn btn-primary" disabled={loading} onClick={handleCustomAsk}>
            Ask
          </button>
        </div>

        {loading && <SkeletonBlock lines={2} />}
        {error && <Banner variant="error">{error}</Banner>}
      </Card>

      {history.length === 0 && !loading && (
        <EmptyState title="No questions asked yet" description="Try one of the preset questions above to get started." />
      )}

      <div className="stack">
        {history
          .slice()
          .reverse()
          .map((turn, index) => (
            <ConversationTurnView key={`${turn.answer.requestId ?? turn.answer.sessionId}-${index}`} turn={turn} />
          ))}
      </div>
    </div>
  );
}

function ConversationTurnView({ turn }: { turn: ConversationTurn }) {
  const { answer } = turn;

  return (
    <Card>
      <p className="text-secondary">Q: {turn.question}</p>

      {answer.status === 'rejected' && <Banner variant="error">Unable to answer: {answer.rejectionReason}</Banner>}

      {answer.status === 'unavailable' && <Banner variant="info">The AI Consultant has no answer available right now.</Banner>}

      {answer.status === 'completed' && (
        <div className="stack">
          <div className="section">
            <div className="cluster">
              <h4>AI Interpretation</h4>
              {answer.confidence && <Badge variant={CONFIDENCE_VARIANT}>{answer.confidence}</Badge>}
            </div>
            <p>{answer.answer}</p>
          </div>

          <div className="section">
            <h4>Facts (Evidence)</h4>
            {answer.facts.length === 0 && <p className="text-secondary">No supporting facts.</p>}
            <ul className="stack-sm">
              {answer.facts.map((fact, index) => (
                <li key={index} className="text-secondary">
                  {fact.label}: {fact.value}
                </li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h4>Suggested Actions</h4>
            {answer.suggestedActions.length === 0 && <p className="text-secondary">No suggested actions.</p>}
            <ul className="stack-sm">
              {answer.suggestedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h4>Related Findings</h4>
            {answer.relatedFindings.length === 0 && <p className="text-secondary">No related findings.</p>}
            <ul className="stack-sm">
              {answer.relatedFindings.map((finding) => (
                <li key={finding.findingId} className="text-secondary">
                  {finding.ruleId} ({finding.sourceEngine}/{finding.category}): {finding.outcome}
                </li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h4>Related Optimization Items</h4>
            {answer.relatedOptimizationItems.length === 0 && <p className="text-secondary">No related optimization items.</p>}
            <ul className="stack-sm">
              {answer.relatedOptimizationItems.map((item) => (
                <li key={`${item.optimizationRuleId}-${item.optimizationRuleVersion}`} className="text-secondary">
                  {item.title} (priority: <Badge>{item.priority}</Badge>)
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
