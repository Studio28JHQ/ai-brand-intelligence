import { Inject, Injectable } from '@nestjs/common';
import type { AuditHistoryEntry } from '@ai-visibility/contracts';
import { AUDIT_REPOSITORY, AuditRepository } from '../../domain/audit/audit.repository';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { FindingReadRepository } from '../../infrastructure/comparison/finding-read.repository';
import { HeuristicReadRepository } from '../../infrastructure/comparison/heuristic-read.repository';
import { SignalReadRepository } from '../../infrastructure/comparison/signal-read.repository';
import { computeScores } from '../scoring/compute-scores';

const FULL_AUDIT_TYPE_LABEL = 'Full Audit';

@Injectable()
export class AuditHistoryQueryService {
  constructor(
    @Inject(AUDIT_REPOSITORY) private readonly auditRepository: AuditRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    private readonly findingReadRepository: FindingReadRepository,
    private readonly heuristicReadRepository: HeuristicReadRepository,
    private readonly signalReadRepository: SignalReadRepository,
  ) {}

  async list(): Promise<AuditHistoryEntry[]> {
    const [audits, projects] = await Promise.all([this.auditRepository.findAll(), this.projectRepository.findAll()]);
    const projectById = new Map(projects.map((project) => [project.id, project]));

    // Overall Score requires a real Finding/Heuristic/Signal fetch — only worth doing for Audits
    // that actually finished successfully; every other status is honestly null, not fabricated.
    const completedAuditIds = audits.filter((audit) => audit.status === 'completed').map((audit) => audit.id);
    const [findingsByAuditId, heuristicsByAuditId, signalsByAuditId] = await Promise.all([
      this.findingReadRepository.findByAuditIds(completedAuditIds),
      this.heuristicReadRepository.findByAuditIds(completedAuditIds),
      this.signalReadRepository.findByAuditIds(completedAuditIds),
    ]);

    return audits.map((audit) => {
      const project = projectById.get(audit.projectId);
      const finishedAt = audit.completedAt ?? audit.failedAt ?? audit.cancelledAt;

      const overallScore =
        audit.status === 'completed'
          ? computeScores(
              findingsByAuditId.get(audit.id) ?? [],
              heuristicsByAuditId.get(audit.id) ?? [],
              signalsByAuditId.get(audit.id) ?? [],
            ).overall
          : null;

      return {
        id: audit.id,
        projectId: audit.projectId,
        projectName: project?.name ?? 'Unknown Project',
        url: audit.url,
        status: audit.status,
        createdAt: audit.createdAt.toISOString(),
        startedAt: audit.startedAt ? audit.startedAt.toISOString() : null,
        finishedAt: finishedAt ? finishedAt.toISOString() : null,
        durationMs: audit.startedAt && finishedAt ? finishedAt.getTime() - audit.startedAt.getTime() : null,
        overallScore,
        triggeredBy: audit.triggeredBy,
        auditType: FULL_AUDIT_TYPE_LABEL,
        isBaseline: project?.baselineAuditId === audit.id,
      };
    });
  }
}
