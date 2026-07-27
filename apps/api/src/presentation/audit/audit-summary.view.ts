import type {
  AiVisibilityResult,
  CreateAuditResponse,
  CrawlResult,
  EngineResult,
  ExtractionResult,
  HeuristicResult,
  InventoryResult,
} from '@ai-visibility/contracts';
import { AuditSnapshot } from '../../domain/audit/audit-snapshot';
import { DiscoveryResult } from '../../domain/audit/discovery-result';
import { generateOptimizationPlan } from '../../application/optimization/generate-optimization-plan';
import { computeScores } from '../../application/scoring/compute-scores';

export function buildAuditSummary(snapshot: AuditSnapshot): CreateAuditResponse {
  const discovery = (snapshot.engineResults.discovery as EngineResult<DiscoveryResult>).output!;
  const crawl = (snapshot.engineResults.crawl as EngineResult<CrawlResult>).output!;
  const inventory = (snapshot.engineResults.inventory as EngineResult<InventoryResult>).output!;
  const extraction = (snapshot.engineResults.extraction as EngineResult<ExtractionResult>).output!;
  const coreHeuristics = (snapshot.engineResults.heuristics as EngineResult<HeuristicResult>).output!;
  const aiVisibilityResult = (snapshot.engineResults.aiVisibility as EngineResult<AiVisibilityResult>).output!;
  const aiVisibilityHeuristics = (
    snapshot.engineResults.aiVisibilityHeuristics as EngineResult<HeuristicResult>
  ).output!;
  const signals = [...extraction.signals, ...aiVisibilityResult.signals];
  const heuristics = [...coreHeuristics.heuristics, ...aiVisibilityHeuristics.heuristics];

  return {
    id: snapshot.audit.id,
    status: snapshot.audit.status,
    discovery: {
      normalizedUrl: discovery.normalizedUrl,
      robotsTxtDetected: discovery.robotsTxtDetected,
      sitemapDetected: discovery.sitemapDetected,
    },
    crawl: {
      httpStatus: crawl.httpStatus,
      finalUrl: crawl.finalUrl,
      htmlSizeBytes: Buffer.byteLength(crawl.html, 'utf8'),
      success: crawl.success,
      redirectChain: crawl.redirectChain,
    },
    inventory: {
      title: inventory.title,
      canonicalUrl: inventory.canonicalUrl,
      language: inventory.language,
      h1Count: inventory.h1Count,
      internalLinkCount: inventory.internalLinkCount,
      externalLinkCount: inventory.externalLinkCount,
    },
    analysis: {
      findings: snapshot.findings.map((finding) => ({
        id: finding.id,
        ruleId: finding.ruleId,
        ruleVersion: finding.ruleVersion,
        category: finding.category,
        sourceEngine: finding.sourceEngine,
        outcome: finding.outcome,
        severity: finding.severity,
        evidence: finding.evidence,
      })),
      ruleSetVersion: snapshot.ruleSetVersion,
    },
    entity: {
      entities: snapshot.entities.map((item) => ({
        name: item.name,
        type: item.type,
        sourceLocation: item.sourceLocation,
        confidence: item.confidence,
      })),
    },
    knowledgeGraph: {
      totalEntities: snapshot.knowledgeGraph.nodes.length,
      totalRelationships: snapshot.knowledgeGraph.relationships.length,
      entityTypes: [...new Set(snapshot.knowledgeGraph.nodes.map((node) => node.type))],
      relationshipTypes: [...new Set(snapshot.knowledgeGraph.relationships.map((relationship) => relationship.type))],
    },
    aiVisibility: {
      status: snapshot.aiVisibility.status,
      graphCompleteness: snapshot.aiVisibility.graphCompleteness,
      entityCoverage: snapshot.aiVisibility.entityCoverage,
      relationshipCoverage: snapshot.aiVisibility.relationshipCoverage,
      missingSignals: snapshot.aiVisibility.missingSignals,
      assessedAt: snapshot.aiVisibility.assessedAt,
    },
    optimizationPlan: {
      items: generateOptimizationPlan(
        { projectId: snapshot.audit.projectId, auditId: snapshot.audit.id, cycleId: snapshot.audit.cycleId },
        snapshot.findings,
        snapshot.aiVisibility,
        snapshot.knowledgeGraph,
      ),
    },
    scores: computeScores(snapshot.findings, heuristics, signals),
    progress: [...snapshot.progress],
    executionHistory: [...snapshot.history],
  };
}
