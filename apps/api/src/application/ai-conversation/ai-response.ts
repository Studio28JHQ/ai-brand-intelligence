import type { OptimizationLevel } from '@ai-visibility/contracts';

export type AiResponseStatus = 'completed' | 'unavailable';

export interface AiResponseFact {
  label: string;
  value: string;
}

export interface AiResponseFindingReference {
  findingId: string;
  ruleId: string;
  category: string;
  sourceEngine: string;
  outcome: string;
}

export interface AiResponseOptimizationItemReference {
  optimizationRuleId: string;
  optimizationRuleVersion: string;
  title: string;
  priority: OptimizationLevel;
}

export interface AiResponse {
  requestId: string;
  status: AiResponseStatus;
  content: string | null;
  providerId: string;
  facts: AiResponseFact[];
  suggestedActions: string[];
  confidence: OptimizationLevel | null;
  relatedFindings: AiResponseFindingReference[];
  relatedOptimizationItems: AiResponseOptimizationItemReference[];
}
