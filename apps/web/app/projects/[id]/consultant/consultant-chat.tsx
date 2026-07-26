'use client';

import { useState } from 'react';
import type { ConsultantAnswer, ConsultantIntentType } from '@ai-visibility/contracts';
import { askConsultant } from '../../../actions';

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
    <div>
      <p>
        {PRESET_QUESTIONS.map((preset) => (
          <button
            key={preset.intentType}
            type="button"
            disabled={loading}
            onClick={() => ask(preset.intentType, preset.question)}
            style={{ marginRight: '0.5rem' }}
          >
            {preset.question}
          </button>
        ))}
      </p>

      <p>
        <input
          type="text"
          value={customQuestion}
          onChange={(event) => setCustomQuestion(event.target.value)}
          placeholder="Ask a question about this Project"
        />
        <button type="button" disabled={loading} onClick={handleCustomAsk}>
          Ask
        </button>
      </p>

      {loading && <p>Thinking...</p>}
      {error && <p>{error}</p>}

      <div>
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
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <p>
        <strong>Q:</strong> {turn.question}
      </p>

      {answer.status === 'rejected' && (
        <p>
          <strong>Unable to answer:</strong> {answer.rejectionReason}
        </p>
      )}

      {answer.status === 'unavailable' && <p>The AI Consultant has no answer available right now.</p>}

      {answer.status === 'completed' && (
        <>
          <section>
            <h4>AI Interpretation</h4>
            <p>{answer.answer}</p>
            {answer.confidence && (
              <p>
                <strong>Confidence:</strong> {answer.confidence}
              </p>
            )}
          </section>

          <section>
            <h4>Facts (Evidence)</h4>
            {answer.facts.length === 0 && <p>No supporting facts.</p>}
            <ul>
              {answer.facts.map((fact, index) => (
                <li key={index}>
                  {fact.label}: {fact.value}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4>Suggested Actions</h4>
            {answer.suggestedActions.length === 0 && <p>No suggested actions.</p>}
            <ul>
              {answer.suggestedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4>Related Findings</h4>
            {answer.relatedFindings.length === 0 && <p>No related findings.</p>}
            <ul>
              {answer.relatedFindings.map((finding) => (
                <li key={finding.findingId}>
                  {finding.ruleId} ({finding.sourceEngine}/{finding.category}): {finding.outcome}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4>Related Optimization Items</h4>
            {answer.relatedOptimizationItems.length === 0 && <p>No related optimization items.</p>}
            <ul>
              {answer.relatedOptimizationItems.map((item) => (
                <li key={`${item.optimizationRuleId}-${item.optimizationRuleVersion}`}>
                  {item.title} (priority: {item.priority})
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
