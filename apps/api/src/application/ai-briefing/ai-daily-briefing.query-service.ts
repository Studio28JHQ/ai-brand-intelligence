import { Inject, Injectable } from '@nestjs/common';
import type { BriefingModel } from '@ai-visibility/contracts';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { CLIENT_REPOSITORY, ClientRepository } from '../../domain/client/client.repository';
import { AiContextBuilderService } from '../ai-context/ai-context-builder.service';
import { buildBriefingItemsForProject } from './briefing-items';
import { sortBriefingItems } from './briefing-prioritization';

export const BRIEFING_VERSION = '1.0.0';

@Injectable()
export class AiDailyBriefingQueryService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository,
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: ClientRepository,
    private readonly aiContextBuilderService: AiContextBuilderService,
  ) {}

  async build(): Promise<BriefingModel> {
    const [projects, clients] = await Promise.all([this.projectRepository.findAll(), this.clientRepository.findAll()]);

    const activeClientIds = new Set(
      clients.filter((client) => client.status === 'active').map((client) => client.id),
    );
    const activeProjects = projects.filter((project) => activeClientIds.has(project.clientId));

    const contexts = await Promise.all(activeProjects.map((project) => this.aiContextBuilderService.build(project.id)));

    const items = sortBriefingItems(contexts.flatMap((context) => buildBriefingItemsForProject(context)));

    return {
      briefingVersion: BRIEFING_VERSION,
      generatedAt: new Date().toISOString(),
      projectsSummarized: activeProjects.length,
      items,
    };
  }
}
