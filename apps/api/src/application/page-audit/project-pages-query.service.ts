import { Inject, Injectable } from '@nestjs/common';
import type { ProjectPage } from '@ai-visibility/contracts';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { Audit } from '../../domain/audit/audit.entity';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { SignalReadRepository } from '../../infrastructure/comparison/signal-read.repository';
import { HeuristicReadRepository } from '../../infrastructure/comparison/heuristic-read.repository';
import { AiVisibilityReadRepository } from '../../infrastructure/comparison/ai-visibility-read.repository';
import { KnowledgeGraphReadRepository } from '../../infrastructure/comparison/knowledge-graph-read.repository';
import { computeScores } from '../scoring/compute-scores';
import { generateOptimizationPlan } from '../optimization/generate-optimization-plan';
import { sortByPriority } from '../optimization/optimization-prioritization';

function emptyPage(audit: Audit): ProjectPage {
  return {
    url: audit.url,
    latestAuditId: audit.id,
    status: audit.status,
    overallScore: null,
    seoScore: null,
    aiVisibilityScore: null,
    lastAuditAt: audit.completedAt ? audit.completedAt.toISOString() : null,
    findingsCount: 0,
    priority: null,
  };
}

// A "Page" is a distinct URL within a Project, derived entirely from that Project's existing
// Audits — no new persistence, no new analysis. This mirrors the exact composition discipline
// already established by ExecutiveDashboardQueryService (CTO-061): read already-computed Read
// Models (Findings, Signals, Heuristics, the AI Visibility Assessment, the Knowledge Graph) and
// project them, computing nothing a Rule/Heuristic/Engine hasn't already computed.
@Injectable()
export class ProjectPagesQueryService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly signalReadRepository: SignalReadRepository,
    private readonly heuristicReadRepository: HeuristicReadRepository,
    private readonly aiVisibilityReadRepository: AiVisibilityReadRepository,
    private readonly knowledgeGraphReadRepository: KnowledgeGraphReadRepository,
  ) {}

  async listByProjectId(projectId: string): Promise<ProjectPage[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const allAudits = await this.auditRepository.findAll();
    const projectAudits = allAudits.filter((audit) => audit.projectId === projectId);

    // Every Audit today audits exactly one URL; a Page is that URL's most recent Audit, so
    // running the same URL again simply moves the Page forward rather than creating a duplicate.
    const latestByUrl = new Map<string, Audit>();
    for (const audit of projectAudits) {
      const current = latestByUrl.get(audit.url);
      if (!current || audit.createdAt.getTime() > current.createdAt.getTime()) {
        latestByUrl.set(audit.url, audit);
      }
    }

    return Promise.all([...latestByUrl.values()].map((audit) => this.buildPage(audit)));
  }

  private async buildPage(audit: Audit): Promise<ProjectPage> {
    if (audit.status !== 'completed') {
      return emptyPage(audit);
    }

    const [findings, signals, heuristics, assessment, knowledgeGraph] = await Promise.all([
      this.findingReadRepository.findByAuditId(audit.id),
      this.signalReadRepository.findByAuditId(audit.id),
      this.heuristicReadRepository.findByAuditId(audit.id),
      this.aiVisibilityReadRepository.findByAuditId(audit.id),
      this.knowledgeGraphReadRepository.findByAuditId(audit.id),
    ]);

    const scores = computeScores(findings, heuristics, signals);
    const findingsCount = findings.filter((finding) => finding.severity !== 'none').length;

    const optimizationItems = assessment
      ? generateOptimizationPlan(
          { projectId: audit.projectId, auditId: audit.id, cycleId: audit.cycleId },
          findings,
          assessment,
          knowledgeGraph,
        )
      : [];
    const priority = sortByPriority(optimizationItems)[0]?.priority ?? null;

    return {
      url: audit.url,
      latestAuditId: audit.id,
      status: audit.status,
      overallScore: scores.overall,
      seoScore: scores.seo.score,
      aiVisibilityScore: scores.aiVisibility.score,
      lastAuditAt: audit.completedAt ? audit.completedAt.toISOString() : null,
      findingsCount,
      priority,
    };
  }
}
