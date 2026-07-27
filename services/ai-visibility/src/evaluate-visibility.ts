import { createSignal } from '@ai-visibility/analyzers';
import type {
  AiVisibilityAssessment,
  AnalysisSignal,
  CompletenessLevel,
  CoverageLevel,
  KnowledgeGraphResult,
  VisibilityStatus,
} from '@ai-visibility/contracts';

const KNOWN_ENTITY_TYPES = ['name', 'domain'];

function evaluateGraphCompleteness(graph: KnowledgeGraphResult): CompletenessLevel {
  if (graph.nodes.length === 0) {
    return 'incomplete';
  }
  return graph.relationships.length === 0 ? 'partial' : 'complete';
}

function evaluateEntityCoverage(graph: KnowledgeGraphResult): CoverageLevel {
  const presentTypes = new Set(graph.nodes.map((node) => node.type));
  const coveredCount = KNOWN_ENTITY_TYPES.filter((type) => presentTypes.has(type)).length;

  if (coveredCount === 0) {
    return 'none';
  }
  return coveredCount === KNOWN_ENTITY_TYPES.length ? 'covered' : 'partial';
}

function evaluateRelationshipCoverage(graph: KnowledgeGraphResult): CoverageLevel {
  if (graph.relationships.length === 0) {
    return 'none';
  }

  const connectedNodeIds = new Set<string>();
  for (const relationship of graph.relationships) {
    connectedNodeIds.add(relationship.sourceNodeId);
    connectedNodeIds.add(relationship.targetNodeId);
  }

  return connectedNodeIds.size >= graph.nodes.length ? 'covered' : 'partial';
}

function detectMissingSignals(
  graph: KnowledgeGraphResult,
  entityCoverage: CoverageLevel,
  relationshipCoverage: CoverageLevel,
): string[] {
  const signals: string[] = [];

  if (graph.nodes.length === 0) {
    signals.push('no-entities');
  }
  if (!graph.nodes.some((node) => node.type === 'domain')) {
    signals.push('no-domain-entity');
  }
  if (relationshipCoverage === 'none') {
    signals.push('no-relationships');
  } else if (relationshipCoverage === 'partial') {
    signals.push('incomplete-relationship-coverage');
  }
  if (entityCoverage === 'partial') {
    signals.push('incomplete-entity-coverage');
  }

  return signals;
}

function evaluateStatus(
  graphCompleteness: CompletenessLevel,
  entityCoverage: CoverageLevel,
  relationshipCoverage: CoverageLevel,
): VisibilityStatus {
  if (graphCompleteness === 'incomplete' || entityCoverage === 'none') {
    return 'not-ready';
  }
  if (graphCompleteness === 'complete' && entityCoverage === 'covered' && relationshipCoverage === 'covered') {
    return 'ready';
  }
  return 'needs-improvement';
}

export function evaluateVisibility(auditId: string, graph: KnowledgeGraphResult): AiVisibilityAssessment {
  const graphCompleteness = evaluateGraphCompleteness(graph);
  const entityCoverage = evaluateEntityCoverage(graph);
  const relationshipCoverage = evaluateRelationshipCoverage(graph);
  const missingSignals = detectMissingSignals(graph, entityCoverage, relationshipCoverage);
  const status = evaluateStatus(graphCompleteness, entityCoverage, relationshipCoverage);

  return {
    auditId,
    status,
    graphCompleteness,
    entityCoverage,
    relationshipCoverage,
    missingSignals,
    assessedAt: new Date().toISOString(),
  };
}

// Normalizes the already-computed assessment into the shared AnalysisSignal shape so the
// Heuristic/Rules layers can treat it uniformly with every other analyzer's output. This does
// not add new judgment — it's the same assessment, restated as an observation.
export function buildAiVisibilitySignals(assessment: AiVisibilityAssessment): AnalysisSignal[] {
  return [
    createSignal({
      key: 'visibility-assessment',
      category: 'ai-visibility',
      sourceType: 'analyzer',
      sourceId: 'ai-visibility',
      data: {
        status: assessment.status,
        graphCompleteness: assessment.graphCompleteness,
        entityCoverage: assessment.entityCoverage,
        relationshipCoverage: assessment.relationshipCoverage,
        missingSignals: assessment.missingSignals,
      },
    }),
  ];
}
