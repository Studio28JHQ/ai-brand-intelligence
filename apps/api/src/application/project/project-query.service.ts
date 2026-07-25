import { Inject, Injectable } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project/project.repository';
import { Project } from '../../domain/project/project.entity';

@Injectable()
export class ProjectQueryService {
  constructor(@Inject(PROJECT_REPOSITORY) private readonly projectRepository: ProjectRepository) {}

  async list(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }

  async getById(id: string): Promise<Project | null> {
    return this.projectRepository.findById(id);
  }
}
