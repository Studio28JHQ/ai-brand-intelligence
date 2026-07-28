import { Inject, Injectable } from '@nestjs/common';
import type {
  CategoryScoreComparison,
  FindingComparisonEntry,
  PageAuditHistoryEntry,
  PageComparisonIssue,
  PageComparisonResult,
  Scores,
  ScoreTrend,
} from '@ai-visibility/contracts';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { AuditNotCompletedError, AuditNotFoundError, PageComparisonUrlMismatchError } from '../../domain/audit/audit.errors';
import { AuditComparisonService } from '../comparison/audit-comparison.service';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { SignalReadRepository } from '../../infrastructure/comparison/signal-read.repository';
import { HeuristicReadRepository } from '../../infrastructure/comparison/heuristic-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { computeScores } from '../scoring/compute-scores';
import { generateOptimizationPlan } from '../optimization/generate-optimization-plan';

const SCORE_KEYS = ['seo', 'aiVisibility', 'technical', 'content', 'accessibility', 'performance'] as const;

function trendFor(delta: number | null): ScoreTrend {
  if (delta === null) return 'unknown';
  if (delta > 0) return 'improved';
  if (delta < 0) return 'declined';
  return 'unchanged';
}

function compareOneScore(category: string, oldScore: number | null, newScore: number | null): CategoryScoreComparison {
  const delta = oldScore === null || newScore === null ? null : newScore - oldScore;
  return { category, oldScore, newScore, delta, trend: trendFor(delta) };
}

function toIssue(entry: FindingComparisonEntry): PageComparisonIssue {
  return {
    ruleId: entry.ruleId,
    ruleVersion: entry.ruleVersion,
    category: entry.category,
  };
}

// Compares two real, completed Audits of the same Page (URL). Reuses AuditComparisonService
// (F4-S03) for the Finding-level diff — "Persistent Issues" is simply its `unchangedFindings`
// filtered to still-failing, the same real derivation the Impact Assessment already uses for
// "remaining opportunities" (CTO-064) — and reuses computeScores/generateOptimizationPlan
// unchanged. The one genuinely new piece is the numeric score delta/trend: nothing in this
// codebase diffs two Audits' Scores against each other before this service.
@Injectable()
export class PageComparisonService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly auditComparisonService: AuditComparisonService,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly signalReadRepository: SignalReadRepository,
    private readonly heuristicReadRepository: HeuristicReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
    private readonly knowledgeGraphReadRepository: KnowledgeGraphReadRepository,
  ) {}

  async listAuditsForPage(projectId: string, url: string): Promise<PageAuditHistoryEntry[]> {
    const allAudits = await this.auditRepository.findAll();
    return allAudits
      .filter((audit) => audit.projectId === projectId && audit.url === url)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((audit) => ({
        auditId: audit.id,
        status: audit.status,
        createdAt: audit.createdAt.toISOString(),
        completedAt: audit.completedAt ? audit.completedAt.toISOString() : null,
      }));
  }

  async compare(baselineAuditId: string, targetAuditId: string): Promise<PageComparisonResult> {
    const [baselineAudit, targetAudit] = await Promise.all([
      this.auditRepository.findById(baselineAuditId),
      this.auditRepository.findById(targetAuditId),
    ]);

    if (!baselineAudit) {
      throw new AuditNotFoundError(baselineAuditId);
    }
    if (!targetAudit) {
      throw new AuditNotFoundError(targetAuditId);
    }
    if (baselineAudit.url !== targetAudit.url) {
      throw new PageComparisonUrlMismatchError(baselineAuditId, targetAuditId);
    }
    if (baselineAudit.status !== 'completed') {
      throw new AuditNotCompletedError(baselineAuditId);
    }
    if (targetAudit.status !== 'completed') {
      throw new AuditNotCompletedError(targetAuditId);
    }

    const [comparison, baselineScores, targetScores, assessment, knowledgeGraph, targetFindings] = await Promise.all([
      this.auditComparisonService.compare(baselineAuditId, targetAuditId),
      this.loadScores(baselineAuditId),
      this.loadScores(targetAuditId),
      this.aiVisibilityReadRepository.findByAuditId(targetAuditId),
      this.knowledgeGraphReadRepository.findByAuditId(targetAuditId),
      this.findingReadRepository.findByAuditId(targetAuditId),
    ]);

    const persistentEntries = comparison.findings.unchangedFindings.filter((entry) => entry.outcome === 'fail');

    const recommendations = assessment
      ? generateOptimizationPlan(
          { projectId: targetAudit.projectId, auditId: targetAuditId, cycleId: targetAudit.cycleId },
          targetFindings,
          assessment,
          knowledgeGraph,
        )
      : [];

    return {
      url: baselineAudit.url,
      baselineAuditId,
      targetAuditId,
      baselineAuditAt: baselineAudit.completedAt ? baselineAudit.completedAt.toISOString() : null,
      targetAuditAt: targetAudit.completedAt ? targetAudit.completedAt.toISOString() : null,
      scores: [
        compareOneScore('overall', baselineScores.overall, targetScores.overall),
        ...SCORE_KEYS.map((key) => compareOneScore(key, baselineScores[key].score, targetScores[key].score)),
      ],
      newIssues: comparison.findings.newFindings.map(toIssue),
      resolvedIssues: comparison.findings.resolvedFindings.map(toIssue),
      persistentIssues: persistentEntries.map(toIssue),
      recommendations,
    };
  }

  private async loadScores(auditId: string): Promise<Scores> {
    const [findings, signals, heuristics] = await Promise.all([
      this.findingReadRepository.findByAuditId(auditId),
      this.signalReadRepository.findByAuditId(auditId),
      this.heuristicReadRepository.findByAuditId(auditId),
    ]);
    return computeScores(findings, heuristics, signals);
  }
}
