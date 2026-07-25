import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import type { ProjectMetadata } from '@ai-visibility/contracts';
import { ProjectQueryService } from '../../application/project/project-query.service';
import { toProjectMetadata } from './project-metadata.mapper';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectQueryService: ProjectQueryService) {}

  @Get()
  async list(): Promise<ProjectMetadata[]> {
    const projects = await this.projectQueryService.list();
    return projects.map(toProjectMetadata);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProjectMetadata> {
    const project = await this.projectQueryService.getById(id);
    if (!project) {
      throw new NotFoundException(`Project not found: ${id}`);
    }
    return toProjectMetadata(project);
  }
}
