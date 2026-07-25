import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type { ProjectMetadata } from '@ai-visibility/contracts';
import { ProjectQueryService } from '../../application/project/project-query.service';
import { SetProjectBaselineUseCase } from '../../application/project/set-project-baseline.use-case';
import {
  ProjectNotFoundError,
  BaselineAuditMismatchError,
  BaselineAuditNotCompletedError,
} from '../../domain/project/project.errors';
import { AuditNotFoundError } from '../../domain/audit/audit.errors';
import { SetProjectBaselineDto } from './dto/set-project-baseline.dto';
import { toProjectMetadata } from './project-metadata.mapper';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectQueryService: ProjectQueryService,
    private readonly setProjectBaselineUseCase: SetProjectBaselineUseCase,
  ) {}

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

  @Post(':id/baseline')
  async setBaseline(
    @Param('id') id: string,
    @Body() dto: SetProjectBaselineDto,
  ): Promise<ProjectMetadata> {
    if (typeof dto?.auditId !== 'string' || dto.auditId.trim().length === 0) {
      throw new BadRequestException('auditId is required');
    }

    try {
      const project = await this.setProjectBaselineUseCase.execute(id, dto.auditId);
      return toProjectMetadata(project);
    } catch (error) {
      if (error instanceof ProjectNotFoundError || error instanceof AuditNotFoundError) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof BaselineAuditMismatchError || error instanceof BaselineAuditNotCompletedError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
