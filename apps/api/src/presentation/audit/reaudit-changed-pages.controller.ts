import { Controller, NotFoundException, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import type { ReauditChangedPagesResult } from '@ai-visibility/contracts';
import { ReauditChangedPagesUseCase } from '../../application/audit/reaudit-changed-pages.use-case';
import { ProjectNotFoundError } from '../../domain/project/project.errors';

// A separate, small controller (rather than a method on ProjectController) purely to avoid a
// circular ProjectModule <-> AuditModule import: this route needs CreateAuditUseCase
// (AuditModule), and AuditModule already imports ProjectModule for its own needs, so this lives
// in AuditModule instead, exposed under the same intuitive /projects/:id/... path (F10-S04D, see
// docs/04_PROJECT/DECISION_LOG.md#cto-106).
@Controller('projects')
export class ReauditChangedPagesController {
  constructor(private readonly reauditChangedPagesUseCase: ReauditChangedPagesUseCase) {}

  @Post(':id/reaudit-changed-pages')
  async reauditChangedPages(@Param('id') id: string, @Req() req: Request): Promise<ReauditChangedPagesResult> {
    try {
      return await this.reauditChangedPagesUseCase.execute(id, req.correlationId);
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
