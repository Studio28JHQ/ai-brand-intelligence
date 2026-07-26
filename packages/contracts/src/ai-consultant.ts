import type { OptimizationLevel } from './optimization-plan';

export type ConsultantIntentType =
  | 'why'
  | 'what-should-i-do-first'
  | 'what-changed'
  | 'what-is-blocking-visibility'
  | 'general-question';

export type ConsultantAnswerStatus = 'completed' | 'unavailable' | 'rejected';

export interface ConsultantFact {
  label: string;
  value: string;
}

export interface ConsultantFindingReference {
  findingId: string;
  ruleId: string;
  category: string;
  sourceEngine: string;
  outcome: string;
}

export interface ConsultantOptimizationItemReference {
  optimizationRuleId: string;
  optimizationRuleVersion: string;
  title: string;
  priority: OptimizationLevel;
}

export interface ConsultantAnswer {
  sessionId: string;
  requestId: string | null;
  status: ConsultantAnswerStatus;
  question: string;
  answer: string | null;
  facts: ConsultantFact[];
  suggestedActions: string[];
  confidence: OptimizationLevel | null;
  relatedFindings: ConsultantFindingReference[];
  relatedOptimizationItems: ConsultantOptimizationItemReference[];
  rejectionReason: string | null;
}
