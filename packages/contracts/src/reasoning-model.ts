import type { RuleOutcome } from './analysis';
import type { OptimizationLevel } from './optimization-plan';

export interface TriggeringFindingReference {
  findingId: string;
  ruleId: string;
  category: string;
  sourceEngine: string;
  outcome: RuleOutcome;
}

export interface AppliedOptimizationRuleReference {
  ruleId: string;
  ruleVersion: string;
  category: string;
  severity: OptimizationLevel;
}

export interface EvidenceFact {
  field: string;
  value: string;
}

export type KnowledgeGraphFactDimension = 'graphCompleteness' | 'entityCoverage' | 'relationshipCoverage';

export interface KnowledgeGraphFact {
  dimension: KnowledgeGraphFactDimension;
  level: string;
}

export interface EntityRelationshipFact {
  relationshipType: string;
  sourceEntityName: string;
  targetEntityName: string;
}

export type AssumptionCode = 'BINARY_RULE_OUTCOME' | 'UNIFORM_RULE_APPLICABILITY' | 'FIXED_PIPELINE_ORDER';

export interface AssumptionFact {
  code: AssumptionCode;
  description: string;
}

export interface ExpectedOutcomeFact {
  impactLevel: OptimizationLevel;
  targetDimension: string;
}

export interface ReasoningModel {
  triggeringFindings: TriggeringFindingReference[];
  appliedRules: AppliedOptimizationRuleReference[];
  evidence: EvidenceFact[];
  knowledgeGraphFacts: KnowledgeGraphFact[];
  entityRelationships: EntityRelationshipFact[];
  expectedOutcome: ExpectedOutcomeFact;
  confidence: OptimizationLevel;
  assumptions: AssumptionFact[];
}
