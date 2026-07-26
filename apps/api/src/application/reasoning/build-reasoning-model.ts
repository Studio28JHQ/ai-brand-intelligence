import type {
  AiVisibilityAssessment,
  EntityRelationshipFact,
  EvidenceFact,
  Finding,
  KnowledgeGraphFact,
  KnowledgeGraphResult,
  OptimizationLevel,
  PatternReference,
  ReasoningModel,
} from '@ai-visibility/contracts';
import type { OptimizationRuleVersion } from '../optimization-knowledge-base/optimization-rule';
import { buildAssumption } from './reasoning-assumptions';

function evidenceFieldLeaf(field: string): string {
  return field.split('.').pop() ?? field;
}

function buildEvidence(finding: Finding, rule: OptimizationRuleVersion): EvidenceFact[] {
  const evidence = finding.evidence as Record<string, unknown>;

  return rule.evidenceReferences
    .map((field): EvidenceFact | null => {
      const value = evidence[evidenceFieldLeaf(field)];
      return value === undefined ? null : { field, value: String(value) };
    })
    .filter((entry): entry is EvidenceFact => entry !== null);
}

function buildKnowledgeGraphFacts(assessment: AiVisibilityAssessment): KnowledgeGraphFact[] {
  return [
    { dimension: 'graphCompleteness', level: assessment.graphCompleteness },
    { dimension: 'entityCoverage', level: assessment.entityCoverage },
    { dimension: 'relationshipCoverage', level: assessment.relationshipCoverage },
  ];
}

function buildEntityRelationshipFacts(finding: Finding, graph: KnowledgeGraphResult): EntityRelationshipFact[] {
  const evidence = finding.evidence as Record<string, unknown>;
  const evidenceValues = new Set(Object.values(evidence).map((value) => String(value)));
  const nodeNamesById = new Map(graph.nodes.map((node) => [node.id, node.name]));

  return graph.relationships
    .filter((relationship) => {
      const sourceName = nodeNamesById.get(relationship.sourceNodeId);
      const targetName = nodeNamesById.get(relationship.targetNodeId);
      return (!!sourceName && evidenceValues.has(sourceName)) || (!!targetName && evidenceValues.has(targetName));
    })
    .map((relationship) => ({
      relationshipType: relationship.type,
      sourceEntityName: nodeNamesById.get(relationship.sourceNodeId) ?? 'unknown',
      targetEntityName: nodeNamesById.get(relationship.targetNodeId) ?? 'unknown',
    }));
}

function buildAssumptions(dependencyWeight: OptimizationLevel) {
  const assumptions = [buildAssumption('BINARY_RULE_OUTCOME'), buildAssumption('UNIFORM_RULE_APPLICABILITY')];
  if (dependencyWeight !== 'low') {
    assumptions.push(buildAssumption('FIXED_PIPELINE_ORDER'));
  }
  return assumptions;
}

export interface ReasoningContext {
  finding: Finding;
  rule: OptimizationRuleVersion;
  confidence: OptimizationLevel;
  dependencyWeight: OptimizationLevel;
  assessment: AiVisibilityAssessment;
  knowledgeGraph: KnowledgeGraphResult;
  patternReference?: PatternReference | null;
}

export function buildReasoningModel(context: ReasoningContext): ReasoningModel {
  const { finding, rule } = context;

  return {
    triggeringFindings: [
      {
        findingId: finding.id,
        ruleId: finding.ruleId,
        category: finding.category,
        sourceEngine: finding.sourceEngine,
        outcome: finding.outcome,
      },
    ],
    appliedRules: [
      { ruleId: rule.ruleId, ruleVersion: rule.version, category: rule.category, severity: rule.severity },
    ],
    evidence: buildEvidence(finding, rule),
    knowledgeGraphFacts: buildKnowledgeGraphFacts(context.assessment),
    entityRelationships: buildEntityRelationshipFacts(finding, context.knowledgeGraph),
    expectedOutcome: { impactLevel: rule.expectedImpact, targetDimension: 'ai-visibility' },
    confidence: context.confidence,
    assumptions: buildAssumptions(context.dependencyWeight),
    patternReference: context.patternReference ?? null,
  };
}
