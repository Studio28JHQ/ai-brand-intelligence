import type { ProjectMetadata } from '@ai-visibility/contracts';
import { Project } from '../../domain/project/project.entity';

export function toProjectMetadata(project: Project): ProjectMetadata {
  return {
    id: project.id,
    name: project.name,
    canonicalWebsite: project.canonicalWebsite,
    createdAt: project.createdAt.toISOString(),
    lastAuditId: project.lastAuditId,
    baselineAuditId: project.baselineAuditId,
    baselineSetAt: project.baselineSetAt ? project.baselineSetAt.toISOString() : null,
  };
}
