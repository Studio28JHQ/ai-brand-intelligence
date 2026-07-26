import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@ai-visibility/database';
import { Project } from '../../domain/project/project.entity';
import { ProjectNotFoundError } from '../../domain/project/project.errors';
import { ProjectRepository } from '../../domain/project/project.repository';
import { PRISMA_CLIENT } from '../database/database.module';

interface ProjectRecord {
  id: string;
  clientId: string;
  name: string;
  canonicalWebsite: string;
  createdAt: Date;
  lastAuditId: string | null;
  baselineAuditId: string | null;
  baselineSetAt: Date | null;
}

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(clientId: string, name: string, canonicalWebsite: string): Promise<Project> {
    const record = await this.prisma.project.create({ data: { clientId, name, canonicalWebsite } });
    return this.toDomain(record);
  }

  async findByCanonicalWebsite(canonicalWebsite: string): Promise<Project | null> {
    const record = await this.prisma.project.findUnique({ where: { canonicalWebsite } });
    return record ? this.toDomain(record) : null;
  }

  async findById(id: string): Promise<Project | null> {
    const record = await this.prisma.project.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<Project[]> {
    const records = await this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return records.map((record) => this.toDomain(record));
  }

  async updateLastAudit(id: string, auditId: string): Promise<Project> {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new ProjectNotFoundError(id);
    }

    const record = await this.prisma.project.update({
      where: { id },
      data: { lastAuditId: auditId },
    });
    return this.toDomain(record);
  }

  async setBaseline(id: string, auditId: string): Promise<Project> {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new ProjectNotFoundError(id);
    }

    const baselineSetAt = new Date();
    const [record] = await this.prisma.$transaction([
      this.prisma.project.update({
        where: { id },
        data: { baselineAuditId: auditId, baselineSetAt },
      }),
      this.prisma.projectBaselineHistory.create({
        data: { projectId: id, auditId, setAt: baselineSetAt },
      }),
    ]);
    return this.toDomain(record);
  }

  private toDomain(record: ProjectRecord): Project {
    return Project.fromPersistence({
      id: record.id,
      clientId: record.clientId,
      name: record.name,
      canonicalWebsite: record.canonicalWebsite,
      createdAt: record.createdAt,
      lastAuditId: record.lastAuditId,
      baselineAuditId: record.baselineAuditId,
      baselineSetAt: record.baselineSetAt,
    });
  }
}
